"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const Book_1 = require("../../models/Book");
const activity_service_1 = require("../activity/activity.service");
const file_utils_1 = require("../../common/utils/file.utils");
const path = require("path");
const fs = require("fs");
let BooksService = class BooksService {
    constructor(knex, activityService) {
        this.knex = knex;
        this.activityService = activityService;
    }
    async listPublic() {
        return Book_1.Book.query(this.knex)
            .where('is_public', true)
            .orderBy('created_at', 'desc')
            .withGraphFetched('uploader')
            .modifyGraph('uploader', (builder) => builder.select('id', 'full_name'));
    }
    async getPublic(id) {
        const book = await Book_1.Book.query(this.knex)
            .findById(id)
            .where('is_public', true)
            .withGraphFetched('uploader')
            .modifyGraph('uploader', (builder) => builder.select('id', 'full_name'));
        if (!book)
            throw new common_1.NotFoundException('Book not found');
        return book;
    }
    async listByUser(userId) {
        return Book_1.Book.query(this.knex)
            .where('uploaded_by', userId)
            .orderBy('created_at', 'desc');
    }
    async listAdmin() {
        return Book_1.Book.query(this.knex)
            .orderBy('created_at', 'desc')
            .withGraphFetched('uploader')
            .modifyGraph('uploader', (builder) => builder.select('id', 'full_name', 'email'));
    }
    async findOne(id) {
        const book = await Book_1.Book.query(this.knex).findById(id).withGraphFetched('uploader');
        if (!book)
            throw new common_1.NotFoundException('Book not found');
        return book;
    }
    async create(data, userId, files) {
        var _a, _b;
        const bookFile = (_a = files.file) === null || _a === void 0 ? void 0 : _a[0];
        const coverFile = (_b = files.cover) === null || _b === void 0 ? void 0 : _b[0];
        if (!data.title || !bookFile) {
            throw new common_1.BadRequestException('Title and file are required');
        }
        const isPublic = data.isPublic === 'true' || data.isPublic === true;
        let filePath = `/uploads/books/${bookFile.filename}`;
        if (!isPublic) {
            const src = bookFile.path;
            const dest = path.join(file_utils_1.PRIVATE_BOOK_UPLOADS_DIR, bookFile.filename);
            (0, file_utils_1.safeMoveFile)(src, dest);
            filePath = `private/books/${bookFile.filename}`;
        }
        const coverPath = coverFile ? `/uploads/books/${coverFile.filename}` : null;
        const newBook = await Book_1.Book.query(this.knex).insertAndFetch({
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
    async update(id, data, userId, userRole, files) {
        var _a, _b;
        const book = await this.findOne(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = book.uploaded_by === userId;
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('Forbidden');
        }
        const updateData = {};
        if (data.title)
            updateData.title = data.title;
        if (data.author !== undefined)
            updateData.author = data.author;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.category !== undefined)
            updateData.category = data.category;
        if (data.archiveSource !== undefined)
            updateData.archive_source = data.archiveSource;
        if (data.documentCode !== undefined)
            updateData.document_code = data.documentCode;
        const isPublic = data.isPublic !== undefined
            ? (data.isPublic === 'true' || data.isPublic === true || data.isPublic === 1)
            : !!book.is_public;
        updateData.is_public = Boolean(isPublic);
        const bookFile = (_a = files === null || files === void 0 ? void 0 : files.file) === null || _a === void 0 ? void 0 : _a[0];
        if (bookFile) {
            const oldPath = (0, file_utils_1.resolveStoredFilePath)(book.file_path);
            (0, file_utils_1.safeUnlink)(oldPath);
            let newPath = `/uploads/books/${bookFile.filename}`;
            if (!isPublic) {
                const dest = path.join(file_utils_1.PRIVATE_BOOK_UPLOADS_DIR, bookFile.filename);
                (0, file_utils_1.safeMoveFile)(bookFile.path, dest);
                newPath = `private/books/${bookFile.filename}`;
            }
            updateData.file_path = newPath;
            updateData.file_size = bookFile.size;
        }
        else if (book.is_public !== isPublic) {
            const currentPath = (0, file_utils_1.resolveStoredFilePath)(book.file_path);
            if (currentPath && fs.existsSync(currentPath)) {
                const filename = path.basename(currentPath);
                if (isPublic) {
                    const dest = path.join(file_utils_1.BOOK_UPLOADS_DIR, filename);
                    (0, file_utils_1.safeMoveFile)(currentPath, dest);
                    updateData.file_path = `/uploads/books/${filename}`;
                }
                else {
                    const dest = path.join(file_utils_1.PRIVATE_BOOK_UPLOADS_DIR, filename);
                    (0, file_utils_1.safeMoveFile)(currentPath, dest);
                    updateData.file_path = `private/books/${filename}`;
                }
            }
        }
        const coverFile = (_b = files === null || files === void 0 ? void 0 : files.cover) === null || _b === void 0 ? void 0 : _b[0];
        if (coverFile) {
            if (book.cover_path)
                (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(book.cover_path));
            updateData.cover_path = `/uploads/books/${coverFile.filename}`;
        }
        await Book_1.Book.query(this.knex).patch(updateData).where('id', id);
        await this.activityService.log(userId, 'books', `Updated book: ${book.title}`);
        return { id };
    }
    async delete(id, userId, userRole) {
        const book = await this.findOne(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = book.uploaded_by === userId;
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('Forbidden');
        }
        if (book.file_path)
            (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(book.file_path));
        if (book.cover_path)
            (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(book.cover_path));
        await Book_1.Book.query(this.knex).deleteById(id);
        await this.activityService.log(userId, 'books', `Deleted book: ${book.title}`);
        return { message: 'Deleted' };
    }
    async incrementDownload(id) {
        await Book_1.Book.query(this.knex).increment('download_count', 1).where('id', id);
    }
    getFilePath(book) {
        return (0, file_utils_1.resolveStoredFilePath)(book.file_path);
    }
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [Object, activity_service_1.ActivityService])
], BooksService);
//# sourceMappingURL=books.service.js.map