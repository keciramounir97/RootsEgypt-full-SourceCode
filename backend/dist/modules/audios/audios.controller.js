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
var AudiosController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudiosController = void 0;
const common_1 = require("@nestjs/common");
const audios_service_1 = require("./audios.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const audios_service_2 = require("./audios.service");
const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const audioUploadOptions = {
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            fs.mkdirSync(audios_service_2.AUDIO_UPLOADS_DIR, { recursive: true });
            cb(null, audios_service_2.AUDIO_UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || '');
            cb(null, `audio-${crypto.randomBytes(16).toString('hex')}${ext}`);
        },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
};
let AudiosController = AudiosController_1 = class AudiosController {
    constructor(audiosService) {
        this.audiosService = audiosService;
        this.logger = new common_1.Logger(AudiosController_1.name);
    }
    async listPublic() {
        try {
            return await this.audiosService.listPublic();
        }
        catch (error) {
            this.logger.error(`listPublic failed: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    async getPublic(id) {
        return this.audiosService.getPublic(id);
    }
    async listMy(req) {
        return this.audiosService.listByUser(req.user.id);
    }
    async createMy(body, req, file) {
        return this.audiosService.create(body, req.user.id, file);
    }
    async updateMy(id, body, req, file) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.audiosService.update(id, body, req.user.id, userRole, file);
    }
    async deleteMy(id, req) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.audiosService.delete(id, req.user.id, userRole);
    }
    async listAdmin() {
        return this.audiosService.listAdmin();
    }
    async createAdmin(body, req, file) {
        return this.audiosService.create(body, req.user.id, file);
    }
    async updateAdmin(id, body, req, file) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.audiosService.update(id, body, req.user.id, userRole, file);
    }
    async deleteAdmin(id, req) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.audiosService.delete(id, req.user.id, userRole);
    }
};
exports.AudiosController = AudiosController;
__decorate([
    (0, common_1.Get)('audios'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AudiosController.prototype, "listPublic", null);
__decorate([
    (0, common_1.Get)('audios/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AudiosController.prototype, "getPublic", null);
__decorate([
    (0, common_1.Get)('my/audios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AudiosController.prototype, "listMy", null);
__decorate([
    (0, common_1.Post)('my/audios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', audioUploadOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AudiosController.prototype, "createMy", null);
__decorate([
    (0, common_1.Put)('my/audios/:id'),
    (0, common_1.Patch)('my/audios/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', audioUploadOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AudiosController.prototype, "updateMy", null);
__decorate([
    (0, common_1.Delete)('my/audios/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AudiosController.prototype, "deleteMy", null);
__decorate([
    (0, common_1.Get)('admin/audios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AudiosController.prototype, "listAdmin", null);
__decorate([
    (0, common_1.Post)('admin/audios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', audioUploadOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AudiosController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Put)('admin/audios/:id'),
    (0, common_1.Patch)('admin/audios/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', audioUploadOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AudiosController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Delete)('admin/audios/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AudiosController.prototype, "deleteAdmin", null);
exports.AudiosController = AudiosController = AudiosController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [audios_service_1.AudiosService])
], AudiosController);
//# sourceMappingURL=audios.controller.js.map