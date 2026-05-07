import { Injectable, Inject, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { Document } from '../../models/Document';
import { ActivityService } from '../activity/activity.service';
import { resolveStoredFilePath, safeUnlink, UPLOADS_DIR } from '../../common/utils/file.utils';
import * as path from 'path';

export const DOCUMENT_UPLOADS_DIR = path.join(UPLOADS_DIR, 'documents');

@Injectable()
export class DocumentsService implements OnModuleInit {
    constructor(
        @Inject('KnexConnection') private readonly knex,
        private readonly activityService: ActivityService,
    ) {}

    async onModuleInit() {
        const exists = await this.knex.schema.hasTable('documents');
        if (!exists) {
            await this.knex.schema.createTable('documents', (table) => {
                table.increments('id').primary();
                table.string('title', 255).notNullable();
                table.text('description').nullable();
                table.string('file_path', 512).nullable();
                table.string('file_type', 50).nullable();
                table.string('category', 100).nullable();
                table.string('archive_source', 255).nullable();
                table.string('document_code', 100).nullable();
                table.string('date', 50).nullable();
                table.integer('uploaded_by').unsigned().nullable();
                table.boolean('is_public').defaultTo(true);
                table.integer('likes').defaultTo(0);
                table.timestamp('created_at').defaultTo(this.knex.fn.now());
                table.timestamp('updated_at').defaultTo(this.knex.fn.now());
            });
            return;
        }

        if (!(await this.knex.schema.hasColumn('documents', 'category'))) {
            await this.knex.schema.alterTable('documents', (table) => {
                table.string('category', 100).nullable();
            });
        }
    }

    async listPublic() {
        return Document.query(this.knex).where('is_public', true).orderBy('created_at', 'desc');
    }

    async getPublic(id: number) {
        const doc = await Document.query(this.knex).findById(id).where('is_public', true);
        if (!doc) throw new NotFoundException('Document not found');
        return doc;
    }

    async listByUser(userId: number) {
        return Document.query(this.knex).where('uploaded_by', userId).orderBy('created_at', 'desc');
    }

    async listAdmin() {
        return Document.query(this.knex).orderBy('created_at', 'desc');
    }

    async findOne(id: number) {
        const doc = await Document.query(this.knex).findById(id);
        if (!doc) throw new NotFoundException('Document not found');
        return doc;
    }

    async create(data: any, userId: number, file?: Express.Multer.File) {
        const filePath = file ? `/uploads/documents/${file.filename}` : null;
        const ext = file ? path.extname(file.originalname).replace('.', '').toUpperCase() : null;

        const doc = await Document.query(this.knex).insertAndFetch({
            title: data.title,
            description: data.description || null,
            file_path: filePath,
            file_type: data.fileType || ext || null,
            category: data.category || null,
            archive_source: data.archiveSource || null,
            document_code: data.documentCode || null,
            date: data.date || null,
            uploaded_by: userId,
            is_public: data.isPublic !== 'false' && data.isPublic !== false,
            likes: 0,
        });

        await this.activityService.log(userId, 'documents', `Uploaded document: ${data.title}`);
        return doc;
    }

    async update(id: number, data: any, userId: number, userRole: number, file?: Express.Multer.File) {
        const doc = await this.findOne(id);
        const roleId = Number(userRole ?? 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = doc.uploaded_by === userId;
        if (!isAdmin && !isOwner) throw new ForbiddenException('Forbidden');

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.archiveSource !== undefined) updateData.archive_source = data.archiveSource;
        if (data.documentCode !== undefined) updateData.document_code = data.documentCode;
        if (data.date !== undefined) updateData.date = data.date;
        if (data.isPublic !== undefined) updateData.is_public = data.isPublic !== 'false' && data.isPublic !== false;

        if (file) {
            if (doc.file_path) safeUnlink(resolveStoredFilePath(doc.file_path));
            const ext = path.extname(file.originalname).replace('.', '').toUpperCase();
            updateData.file_path = `/uploads/documents/${file.filename}`;
            updateData.file_type = ext || doc.file_type;
        }

        await Document.query(this.knex).patch(updateData).where('id', id);
        await this.activityService.log(userId, 'documents', `Updated document: ${doc.title}`);
        return { id };
    }

    async delete(id: number, userId: number, userRole: number) {
        const doc = await this.findOne(id);
        const roleId = Number(userRole ?? 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = doc.uploaded_by === userId;
        if (!isAdmin && !isOwner) throw new ForbiddenException('Forbidden');

        if (doc.file_path) safeUnlink(resolveStoredFilePath(doc.file_path));
        await Document.query(this.knex).deleteById(id);
        await this.activityService.log(userId, 'documents', `Deleted document: ${doc.title}`);
        return { message: 'Deleted' };
    }
}
