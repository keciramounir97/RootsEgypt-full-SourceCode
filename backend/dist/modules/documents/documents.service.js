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
exports.DocumentsService = exports.DOCUMENT_UPLOADS_DIR = void 0;
const common_1 = require("@nestjs/common");
const Document_1 = require("../../models/Document");
const activity_service_1 = require("../activity/activity.service");
const file_utils_1 = require("../../common/utils/file.utils");
const path = require("path");
exports.DOCUMENT_UPLOADS_DIR = path.join(file_utils_1.UPLOADS_DIR, 'documents');
let DocumentsService = class DocumentsService {
    constructor(knex, activityService) {
        this.knex = knex;
        this.activityService = activityService;
    }
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
        return Document_1.Document.query(this.knex).where('is_public', true).orderBy('created_at', 'desc');
    }
    async getPublic(id) {
        const doc = await Document_1.Document.query(this.knex).findById(id).where('is_public', true);
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    async listByUser(userId) {
        return Document_1.Document.query(this.knex).where('uploaded_by', userId).orderBy('created_at', 'desc');
    }
    async listAdmin() {
        return Document_1.Document.query(this.knex).orderBy('created_at', 'desc');
    }
    async findOne(id) {
        const doc = await Document_1.Document.query(this.knex).findById(id);
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    async create(data, userId, file) {
        const filePath = file ? `/uploads/documents/${file.filename}` : null;
        const ext = file ? path.extname(file.originalname).replace('.', '').toUpperCase() : null;
        const doc = await Document_1.Document.query(this.knex).insertAndFetch({
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
    async update(id, data, userId, userRole, file) {
        const doc = await this.findOne(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = doc.uploaded_by === userId;
        if (!isAdmin && !isOwner)
            throw new common_1.ForbiddenException('Forbidden');
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.category !== undefined)
            updateData.category = data.category;
        if (data.archiveSource !== undefined)
            updateData.archive_source = data.archiveSource;
        if (data.documentCode !== undefined)
            updateData.document_code = data.documentCode;
        if (data.date !== undefined)
            updateData.date = data.date;
        if (data.isPublic !== undefined)
            updateData.is_public = data.isPublic !== 'false' && data.isPublic !== false;
        if (file) {
            if (doc.file_path)
                (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(doc.file_path));
            const ext = path.extname(file.originalname).replace('.', '').toUpperCase();
            updateData.file_path = `/uploads/documents/${file.filename}`;
            updateData.file_type = ext || doc.file_type;
        }
        await Document_1.Document.query(this.knex).patch(updateData).where('id', id);
        await this.activityService.log(userId, 'documents', `Updated document: ${doc.title}`);
        return { id };
    }
    async delete(id, userId, userRole) {
        const doc = await this.findOne(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = doc.uploaded_by === userId;
        if (!isAdmin && !isOwner)
            throw new common_1.ForbiddenException('Forbidden');
        if (doc.file_path)
            (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(doc.file_path));
        await Document_1.Document.query(this.knex).deleteById(id);
        await this.activityService.log(userId, 'documents', `Deleted document: ${doc.title}`);
        return { message: 'Deleted' };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [Object, activity_service_1.ActivityService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map