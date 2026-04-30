import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Book } from '../../models/Book';
import { ActivityService } from '../activity/activity.service';
import { resolveStoredFilePath, safeUnlink, safeMoveFile, PRIVATE_BOOK_UPLOADS_DIR, BOOK_UPLOADS_DIR } from '../../common/utils/file.utils';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BooksService {
    constructor(
        @Inject('KnexConnection') private readonly knex,
        private readonly activityService: ActivityService,
    ) { }

    async listPublic() {
        return Book.query(this.knex)
            .where('is_public', true)
            .orderBy('created_at', 'desc')
            .withGraphFetched('uploader')
            .modifyGraph('uploader', (builder) => builder.select('id', 'full_name'));
    }

    async getPublic(id: number) {
        const book = await Book.query(this.knex)
            .findById(id)
            .where('is_public', true)
            .withGraphFetched('uploader')
            .modifyGraph('uploader', (builder) => builder.select('id', 'full_name'));

        if (!book) throw new NotFoundException('Book not found');
        return book;
    }

    async listByUser(userId: number) {
        return Book.query(this.knex)
            .where('uploaded_by', userId)
            .orderBy('created_at', 'desc');
    }

    async listAdmin() {
        return Book.query(this.knex)
            .orderBy('created_at', 'desc')
            .withGraphFetched('uploader')
            .modifyGraph('uploader', (builder: any) => builder.select('id', 'full_name', 'email'));
    }

    async findOne(id: number) {
        const book = await Book.query(this.knex).findById(id).withGraphFetched('uploader');
        if (!book) throw new NotFoundException('Book not found');
        return book;
    }

    async create(data: any, userId: number, files: { file?: Express.Multer.File[], cover?: Express.Multer.File[] }) {
        const bookFile = files.file?.[0];
        const coverFile = files.cover?.[0];

        if (!data.title || !bookFile) {
            throw new BadRequestException('Title and file are required');
        }

        const isPublic = data.isPublic === 'true' || data.isPublic === true;
        let filePath = `/uploads/books/${bookFile.filename}`;

        if (!isPublic) {
            const src = bookFile.path;
            const dest = path.join(PRIVATE_BOOK_UPLOADS_DIR, bookFile.filename);
            safeMoveFile(src, dest);
            filePath = `private/books/${bookFile.filename}`;
            // Multer puts it in public uploads by default (configured in module), so we move it.
        }

        const coverPath = coverFile ? `/uploads/books/${coverFile.filename}` : null;

        const newBook = await Book.query(this.knex).insertAndFetch({
            title: data.title,
            author: data.author,
            description: data.description,
            category: data.category,
            archive_source: data.archiveSource,
            document_code: data.documentCode,
            file_path: filePath,
            cover_path: coverPath,
            file_size: bookFile.size,
            uploaded_by: userId,
            is_public: isPublic,
            download_count: 0
        });

        await this.activityService.log(userId, 'books', `Uploaded book: ${data.title}`);
        return newBook;
    }

    async update(id: number, data: any, userId: number, userRole: number, files: { file?: Express.Multer.File[], cover?: Express.Multer.File[] }) {
        const book = await this.findOne(id);

        const roleId = Number(userRole ?? 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = book.uploaded_by === userId;
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException('Forbidden');
        }

        const updateData: any = {};
        if (data.title) updateData.title = data.title;
        if (data.author !== undefined) updateData.author = data.author;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.archiveSource !== undefined) updateData.archive_source = data.archiveSource;
        if (data.documentCode !== undefined) updateData.document_code = data.documentCode;

        const isPublic = data.isPublic !== undefined
            ? (data.isPublic === 'true' || data.isPublic === true || data.isPublic === 1)
            : !!book.is_public;
        updateData.is_public = Boolean(isPublic);

        // Handle File Update
        const bookFile = files?.file?.[0];
        if (bookFile) {
            // Delete old
            const oldPath = resolveStoredFilePath(book.file_path);
            safeUnlink(oldPath);

            // Save new
            let newPath = `/uploads/books/${bookFile.filename}`;
            if (!isPublic) {
                const dest = path.join(PRIVATE_BOOK_UPLOADS_DIR, bookFile.filename);
                safeMoveFile(bookFile.path, dest);
                newPath = `private/books/${bookFile.filename}`;
            }
            updateData.file_path = newPath;
            updateData.file_size = bookFile.size;
        } else if (book.is_public !== isPublic) {
            // Move existing file if visibility changed
            const currentPath = resolveStoredFilePath(book.file_path);
            if (currentPath && fs.existsSync(currentPath)) {
                const filename = path.basename(currentPath);
                if (isPublic) {
                    const dest = path.join(BOOK_UPLOADS_DIR, filename);
                    safeMoveFile(currentPath, dest);
                    updateData.file_path = `/uploads/books/${filename}`;
                } else {
                    const dest = path.join(PRIVATE_BOOK_UPLOADS_DIR, filename);
                    safeMoveFile(currentPath, dest);
                    updateData.file_path = `private/books/${filename}`;
                }
            }
        }

        // Handle Cover Update
        const coverFile = files?.cover?.[0];
        if (coverFile) {
            if (book.cover_path) safeUnlink(resolveStoredFilePath(book.cover_path));
            updateData.cover_path = `/uploads/books/${coverFile.filename}`;
        }

        await Book.query(this.knex).patch(updateData).where('id', id);
        await this.activityService.log(userId, 'books', `Updated book: ${book.title}`);

        return { id };
    }

    async delete(id: number, userId: number, userRole: number) {
        const book = await this.findOne(id);

        const roleId = Number(userRole ?? 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = book.uploaded_by === userId;
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException('Forbidden');
        }

        if (book.file_path) safeUnlink(resolveStoredFilePath(book.file_path));
        if (book.cover_path) safeUnlink(resolveStoredFilePath(book.cover_path));

        await Book.query(this.knex).deleteById(id);
        await this.activityService.log(userId, 'books', `Deleted book: ${book.title}`);

        return { message: 'Deleted' };
    }

    async incrementDownload(id: number) {
        await Book.query(this.knex).increment('download_count', 1).where('id', id);
    }

    getFilePath(book: Book) {
        return resolveStoredFilePath(book.file_path);
    }
}
