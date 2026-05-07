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
var ArticlesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesController = void 0;
const common_1 = require("@nestjs/common");
const articles_service_1 = require("./articles.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ArticlesController = ArticlesController_1 = class ArticlesController {
    constructor(articlesService) {
        this.articlesService = articlesService;
        this.logger = new common_1.Logger(ArticlesController_1.name);
    }
    async listPublic() {
        try {
            return await this.articlesService.listPublic();
        }
        catch (error) {
            this.logger.error(`listPublic failed: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    async getPublic(id) {
        return this.articlesService.getPublic(id);
    }
    async listMy(req) {
        return this.articlesService.listByUser(req.user.id);
    }
    async createMy(body, req) {
        return this.articlesService.create(body, req.user.id);
    }
    async updateMy(id, body, req) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.articlesService.update(id, body, req.user.id, userRole);
    }
    async deleteMy(id, req) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.articlesService.delete(id, req.user.id, userRole);
    }
    async like(id, req) {
        return this.articlesService.like(id, req.user.id);
    }
    async listAdmin() {
        return this.articlesService.listAdmin();
    }
    async createAdmin(body, req) {
        return this.articlesService.create(body, req.user.id);
    }
    async updateAdmin(id, body, req) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.articlesService.update(id, body, req.user.id, userRole);
    }
    async deleteAdmin(id, req) {
        var _a, _b, _c, _d, _e;
        const userRole = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
        return this.articlesService.delete(id, req.user.id, userRole);
    }
};
exports.ArticlesController = ArticlesController;
__decorate([
    (0, common_1.Get)('articles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "listPublic", null);
__decorate([
    (0, common_1.Get)('articles/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "getPublic", null);
__decorate([
    (0, common_1.Get)('my/articles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "listMy", null);
__decorate([
    (0, common_1.Post)('my/articles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "createMy", null);
__decorate([
    (0, common_1.Put)('my/articles/:id'),
    (0, common_1.Patch)('my/articles/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "updateMy", null);
__decorate([
    (0, common_1.Delete)('my/articles/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "deleteMy", null);
__decorate([
    (0, common_1.Post)('my/articles/:id/like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "like", null);
__decorate([
    (0, common_1.Get)('admin/articles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "listAdmin", null);
__decorate([
    (0, common_1.Post)('admin/articles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Put)('admin/articles/:id'),
    (0, common_1.Patch)('admin/articles/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Delete)('admin/articles/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "deleteAdmin", null);
exports.ArticlesController = ArticlesController = ArticlesController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [articles_service_1.ArticlesService])
], ArticlesController);
//# sourceMappingURL=articles.controller.js.map