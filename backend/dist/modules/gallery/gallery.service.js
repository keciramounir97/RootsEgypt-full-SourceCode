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
exports.GalleryService = void 0;
const common_1 = require("@nestjs/common");
const Gallery_1 = require("../../models/Gallery");
const activity_service_1 = require("../activity/activity.service");
const file_utils_1 = require("../../common/utils/file.utils");
let GalleryService = class GalleryService {
    constructor(knex, activityService) {
        this.knex = knex;
        this.activityService = activityService;
    }
    async listPublic() {
        return Gallery_1.Gallery.query(this.knex)
            .where('is_public', true)
            .orderBy('created_at', 'desc')
            .withGraphFetched('uploader')
            .modifyGraph('uploader', (builder) => builder.select('id', 'full_name'));
    }
    async getPublic(id) {
        const item = await Gallery_1.Gallery.query(this.knex)
            .findById(id)
            .where('is_public', true)
            .withGraphFetched('uploader')
            .modifyGraph('uploader', (builder) => builder.select('id', 'full_name'));
        if (!item)
            throw new common_1.NotFoundException('Not found');
        return item;
    }
    async listByUser(userId) {
        return Gallery_1.Gallery.query(this.knex)
            .where('uploaded_by', userId)
            .orderBy('created_at', 'desc');
    }
    async listAdmin() {
        return Gallery_1.Gallery.query(this.knex)
            .orderBy('created_at', 'desc')
            .withGraphFetched('uploader')
            .modifyGraph('uploader', (builder) => builder.select('id', 'full_name', 'email'));
    }
    async findOne(id) {
        const item = await Gallery_1.Gallery.query(this.knex).findById(id).withGraphFetched('uploader');
        if (!item)
            throw new common_1.NotFoundException('Gallery item not found');
        return item;
    }
    async create(data, userId, file) {
        if (!data.title || !file) {
            throw new common_1.BadRequestException('Title and image are required');
        }
        const isPublic = data.isPublic === 'true' || data.isPublic === true;
        const imagePath = `/uploads/gallery/${file.filename}`;
        const newItem = await Gallery_1.Gallery.query(this.knex).insertAndFetch({
            title: data.title,
            description: data.description,
            image_path: imagePath,
            uploaded_by: userId,
            is_public: isPublic,
            archive_source: data.archiveSource,
            document_code: data.documentCode,
            location: data.location,
            year: data.year,
            photographer: data.photographer,
            book_id: data.bookId || data.book_id || null,
            tree_id: data.treeId || data.tree_id || null,
        });
        await this.activityService.log(userId, 'gallery', `Created gallery item: ${data.title}`);
        return newItem;
    }
    async update(id, data, userId, userRole, file) {
        const item = await this.findOne(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = item.uploaded_by === userId;
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('Forbidden');
        }
        const updateData = {};
        if (data.title)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.archiveSource !== undefined)
            updateData.archive_source = data.archiveSource;
        if (data.documentCode !== undefined)
            updateData.document_code = data.documentCode;
        if (data.location !== undefined)
            updateData.location = data.location;
        if (data.year !== undefined)
            updateData.year = data.year;
        if (data.photographer !== undefined)
            updateData.photographer = data.photographer;
        const isPublic = data.isPublic !== undefined
            ? (data.isPublic === 'true' || data.isPublic === true || data.isPublic === 1)
            : !!item.is_public;
        updateData.is_public = Boolean(isPublic);
        if (file) {
            if (item.image_path)
                (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(item.image_path));
            updateData.image_path = `/uploads/gallery/${file.filename}`;
        }
        await Gallery_1.Gallery.query(this.knex).patch(updateData).where('id', id);
        await this.activityService.log(userId, 'gallery', `Updated gallery item: ${item.title}`);
        return { id };
    }
    async delete(id, userId, userRole) {
        const item = await this.findOne(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = item.uploaded_by === userId;
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('Forbidden');
        }
        if (item.image_path)
            (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(item.image_path));
        await Gallery_1.Gallery.query(this.knex).deleteById(id);
        await this.activityService.log(userId, 'gallery', `Deleted gallery item: ${item.title}`);
        return { message: 'Deleted' };
    }
};
exports.GalleryService = GalleryService;
exports.GalleryService = GalleryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [Object, activity_service_1.ActivityService])
], GalleryService);
//# sourceMappingURL=gallery.service.js.map