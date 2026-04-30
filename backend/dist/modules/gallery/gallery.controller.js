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
var GalleryController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryController = void 0;
const common_1 = require("@nestjs/common");
const gallery_service_1 = require("./gallery.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const gallery_dto_1 = require("./dto/gallery.dto");
let GalleryController = GalleryController_1 = class GalleryController {
    constructor(galleryService) {
        this.galleryService = galleryService;
        this.logger = new common_1.Logger(GalleryController_1.name);
    }
    async listPublic() {
        try {
            return await this.galleryService.listPublic();
        }
        catch (error) {
            this.logger.warn(`Failed to load public gallery, returning empty list: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    async getPublic(id) {
        return this.galleryService.getPublic(id);
    }
    async listMy(req) {
        return this.galleryService.listByUser(req.user.id);
    }
    async getMy(id, req) {
        const item = await this.galleryService.findOne(id);
        if (item.uploaded_by !== req.user.id)
            throw new common_1.ForbiddenException();
        return item;
    }
    async createMy(body, req, file) {
        const item = await this.galleryService.create(body, req.user.id, file);
        return item;
    }
    async saveMy(id, body, req, file) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.galleryService.update(id, body, req.user.id, userRole, file);
    }
    async updateMy(id, body, req, file) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.galleryService.update(id, body, req.user.id, userRole, file);
    }
    async deleteMy(id, req) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        await this.galleryService.delete(id, req.user.id, userRole);
        return { message: "Deleted successfully" };
    }
    async listAdmin() {
        return this.galleryService.listAdmin();
    }
    async getAdmin(id) {
        return this.galleryService.findOne(id);
    }
    async createAdmin(body, req, file) {
        return this.galleryService.create(body, req.user.id, file);
    }
    async saveAdmin(id, body, req, file) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.galleryService.update(id, body, req.user.id, userRole, file);
    }
    async updateAdmin(id, body, req, file) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.galleryService.update(id, body, req.user.id, userRole, file);
    }
    async deleteAdmin(id, req) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        await this.galleryService.delete(id, req.user.id, userRole);
        return { message: "Deleted successfully" };
    }
};
exports.GalleryController = GalleryController;
__decorate([
    (0, common_1.Get)('gallery'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "listPublic", null);
__decorate([
    (0, common_1.Get)('gallery/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "getPublic", null);
__decorate([
    (0, common_1.Get)('my/gallery'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "listMy", null);
__decorate([
    (0, common_1.Get)('my/gallery/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "getMy", null);
__decorate([
    (0, common_1.Post)('my/gallery'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
        ],
        fileIsRequired: true
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [gallery_dto_1.CreateGalleryDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "createMy", null);
__decorate([
    (0, common_1.Post)('my/gallery/:id/save'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
        ],
        fileIsRequired: false
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, gallery_dto_1.UpdateGalleryDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "saveMy", null);
__decorate([
    (0, common_1.Put)('my/gallery/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
        ],
        fileIsRequired: false
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, gallery_dto_1.UpdateGalleryDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "updateMy", null);
__decorate([
    (0, common_1.Delete)('my/gallery/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "deleteMy", null);
__decorate([
    (0, common_1.Get)('admin/gallery'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "listAdmin", null);
__decorate([
    (0, common_1.Get)('admin/gallery/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "getAdmin", null);
__decorate([
    (0, common_1.Post)('admin/gallery'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
        ],
        fileIsRequired: true
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [gallery_dto_1.CreateGalleryDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Post)('admin/gallery/:id/save'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
        ],
        fileIsRequired: false
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, gallery_dto_1.UpdateGalleryDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "saveAdmin", null);
__decorate([
    (0, common_1.Put)('admin/gallery/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
        ],
        fileIsRequired: false
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, gallery_dto_1.UpdateGalleryDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Delete)('admin/gallery/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GalleryController.prototype, "deleteAdmin", null);
exports.GalleryController = GalleryController = GalleryController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [gallery_service_1.GalleryService])
], GalleryController);
//# sourceMappingURL=gallery.controller.js.map