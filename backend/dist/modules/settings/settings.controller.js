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
exports.AdminSiteImagesController = exports.PublicSiteImagesController = exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const settings_service_1 = require("./settings.service");
const settings_dto_1 = require("./dto/settings.dto");
const platform_express_1 = require("@nestjs/platform-express");
const file_utils_1 = require("../../common/utils/file.utils");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const siteImageUploadOptions = {
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, file_utils_1.SITE_UPLOADS_DIR),
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || "");
            cb(null, `site-${crypto.randomBytes(16).toString("hex")}${ext}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname || "").toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype || "");
        if (mimetype && extname)
            return cb(null, true);
        return cb(new Error("Only image files are allowed"), false);
    },
};
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getSettings() {
        return this.settingsService.getSettings();
    }
    async updateSettings(body, req) {
        return this.settingsService.updateSettings(body, req.user.id);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.UpdateSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateSettings", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)("admin/settings"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
let PublicSiteImagesController = class PublicSiteImagesController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getSiteImages() {
        return this.settingsService.getSiteImages();
    }
};
exports.PublicSiteImagesController = PublicSiteImagesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicSiteImagesController.prototype, "getSiteImages", null);
exports.PublicSiteImagesController = PublicSiteImagesController = __decorate([
    (0, common_1.Controller)("site-images"),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], PublicSiteImagesController);
let AdminSiteImagesController = class AdminSiteImagesController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getSiteImages() {
        return this.settingsService.getSiteImages();
    }
    async getHeroImages() {
        return this.settingsService.getSiteImages();
    }
    async updateHeroOptions(body, req) {
        return this.settingsService.updateHeroOptions(body, req.user.id);
    }
    async addHeroImages(files, req) {
        return this.settingsService.addHeroImages(files, req.user.id);
    }
    async reorderHeroImages(body, req) {
        const ids = Array.isArray(body === null || body === void 0 ? void 0 : body.ids) ? body.ids.map(Number) : [];
        return this.settingsService.reorderHeroImages(ids, req.user.id);
    }
    async updateHeroImage(id, body, req) {
        return this.settingsService.updateHeroImage(id, body, req.user.id);
    }
    async deleteHeroImage(id, req) {
        return this.settingsService.deleteHeroImage(id, req.user.id);
    }
    async getBackgroundImage() {
        return this.settingsService.getSiteImages();
    }
    async updateBackgroundOptions(body, req) {
        return this.settingsService.updateBackgroundOptions(body, req.user.id);
    }
    async addBackgroundImages(files, req) {
        return this.settingsService.addBackgroundImages(files, req.user.id);
    }
    async deleteBackgroundImage(id, req) {
        return this.settingsService.deleteBackgroundImage(id, req.user.id);
    }
    async deleteBackgroundImages(req) {
        return this.settingsService.deleteBackgroundImages(req.user.id);
    }
};
exports.AdminSiteImagesController = AdminSiteImagesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "getSiteImages", null);
__decorate([
    (0, common_1.Get)("hero"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "getHeroImages", null);
__decorate([
    (0, common_1.Put)("hero"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "updateHeroOptions", null);
__decorate([
    (0, common_1.Post)("hero"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)("images", 12, siteImageUploadOptions)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "addHeroImages", null);
__decorate([
    (0, common_1.Put)("hero/reorder"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "reorderHeroImages", null);
__decorate([
    (0, common_1.Patch)("hero/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "updateHeroImage", null);
__decorate([
    (0, common_1.Delete)("hero/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "deleteHeroImage", null);
__decorate([
    (0, common_1.Get)("background"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "getBackgroundImage", null);
__decorate([
    (0, common_1.Put)("background"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "updateBackgroundOptions", null);
__decorate([
    (0, common_1.Post)("background"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)("images", 12, siteImageUploadOptions)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "addBackgroundImages", null);
__decorate([
    (0, common_1.Delete)("background/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "deleteBackgroundImage", null);
__decorate([
    (0, common_1.Delete)("background"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSiteImagesController.prototype, "deleteBackgroundImages", null);
exports.AdminSiteImagesController = AdminSiteImagesController = __decorate([
    (0, common_1.Controller)("admin/site-images"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], AdminSiteImagesController);
//# sourceMappingURL=settings.controller.js.map