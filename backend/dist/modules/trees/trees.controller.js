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
var TreesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreesController = void 0;
const common_1 = require("@nestjs/common");
const trees_service_1 = require("./trees.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const fs = require("fs");
const path = require("path");
const tree_dto_1 = require("./dto/tree.dto");
const EMPTY_GEDCOM = '0 HEAD\n1 GEDC\n2 VERS 5.5.1\n0 TRLR\n';
let TreesController = TreesController_1 = class TreesController {
    constructor(treesService) {
        this.treesService = treesService;
        this.logger = new common_1.Logger(TreesController_1.name);
    }
    async listPublic() {
        try {
            return await this.treesService.listPublic();
        }
        catch (error) {
            this.logger.error(`listPublic failed: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
            return [];
        }
    }
    async downloadPublicGedcom(id, res) {
        const tree = await this.treesService.getPublic(id);
        const filePath = tree.gedcom_path
            ? this.treesService.getGedcomPath(tree)
            : null;
        if (!filePath || !fs.existsSync(filePath)) {
            res.type("text/plain; charset=utf-8").send(EMPTY_GEDCOM);
            return;
        }
        const ext = path.extname(filePath) || ".ged";
        const safeName = ((tree.title || "tree").replace(/[^\w.-]+/g, "_").trim() || "tree") + ext;
        res.download(filePath, safeName);
    }
    async getPublic(id) {
        return this.treesService.getPublic(id);
    }
    async listMy(req) {
        return this.treesService.listByUser(req.user.id);
    }
    async getMy(id, req) {
        const tree = await this.treesService.findOne(id);
        if (tree.user_id !== req.user.id)
            throw new common_1.ForbiddenException();
        return tree;
    }
    async createMy(body, req, file) {
        return this.treesService.create(body, req.user.id, file);
    }
    async updateMy(id, body, req, file) {
        var _a, _b, _c, _d, _e, _f;
        const userRole = Number((_f = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : 0);
        return this.treesService.update(id, body, req.user.id, userRole, file);
    }
    async saveMy(id, body, req, file) {
        var _a, _b, _c, _d, _e, _f;
        const userRole = Number((_f = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : 0);
        return this.treesService.update(id, body, req.user.id, userRole, file);
    }
    async deleteMy(id, req) {
        var _a, _b, _c, _d, _e, _f;
        const userRole = Number((_f = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : 0);
        return this.treesService.delete(id, req.user.id, userRole);
    }
    async downloadMyGedcom(id, res, req) {
        const tree = await this.treesService.findOne(id);
        if (tree.user_id !== req.user.id)
            throw new common_1.ForbiddenException();
        const filePath = tree.gedcom_path
            ? this.treesService.getGedcomPath(tree)
            : null;
        if (!filePath || !fs.existsSync(filePath)) {
            res.type("text/plain; charset=utf-8").send(EMPTY_GEDCOM);
            return;
        }
        const ext = path.extname(filePath) || ".ged";
        const safeName = ((tree.title || "tree").replace(/[^\w.-]+/g, "_").trim() || "tree") + ext;
        res.download(filePath, safeName);
    }
    async listAdmin() {
        return this.treesService.listAdmin();
    }
    async getAdmin(id) {
        return this.treesService.findOne(id);
    }
    async downloadAdminGedcom(id, res) {
        const tree = await this.treesService.findOne(id);
        const filePath = tree.gedcom_path
            ? this.treesService.getGedcomPath(tree)
            : null;
        if (!filePath || !fs.existsSync(filePath)) {
            res.type("text/plain; charset=utf-8").send(EMPTY_GEDCOM);
            return;
        }
        const ext = path.extname(filePath) || ".ged";
        const safeName = ((tree.title || "tree").replace(/[^\w.-]+/g, "_").trim() || "tree") + ext;
        res.download(filePath, safeName);
    }
    async createAdmin(body, req, file) {
        return this.treesService.create(body, req.user.id, file);
    }
    async saveAdmin(id, body, req, file) {
        var _a, _b, _c, _d, _e, _f;
        const userRole = Number((_f = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : 0);
        return this.treesService.update(id, body, req.user.id, userRole, file);
    }
    async updateAdmin(id, body, req, file) {
        var _a, _b, _c, _d, _e, _f;
        const userRole = Number((_f = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : 0);
        return this.treesService.update(id, body, req.user.id, userRole, file);
    }
    async deleteAdmin(id, req) {
        var _a, _b, _c, _d, _e, _f;
        const userRole = Number((_f = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : 0);
        return this.treesService.delete(id, req.user.id, userRole);
    }
};
exports.TreesController = TreesController;
__decorate([
    (0, common_1.Get)("trees"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "listPublic", null);
__decorate([
    (0, common_1.Get)("trees/:id/gedcom"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "downloadPublicGedcom", null);
__decorate([
    (0, common_1.Get)("trees/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "getPublic", null);
__decorate([
    (0, common_1.Get)("my/trees"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "listMy", null);
__decorate([
    (0, common_1.Get)("my/trees/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "getMy", null);
__decorate([
    (0, common_1.Post)("my/trees"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tree_dto_1.CreateTreeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "createMy", null);
__decorate([
    (0, common_1.Put)("my/trees/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tree_dto_1.UpdateTreeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "updateMy", null);
__decorate([
    (0, common_1.Post)("my/trees/:id/save"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tree_dto_1.UpdateTreeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "saveMy", null);
__decorate([
    (0, common_1.Delete)("my/trees/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "deleteMy", null);
__decorate([
    (0, common_1.Get)("my/trees/:id/gedcom"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "downloadMyGedcom", null);
__decorate([
    (0, common_1.Get)("admin/trees"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "listAdmin", null);
__decorate([
    (0, common_1.Get)("admin/trees/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "getAdmin", null);
__decorate([
    (0, common_1.Get)("admin/trees/:id/gedcom"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "downloadAdminGedcom", null);
__decorate([
    (0, common_1.Post)("admin/trees"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tree_dto_1.CreateTreeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Post)("admin/trees/:id/save"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tree_dto_1.UpdateTreeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "saveAdmin", null);
__decorate([
    (0, common_1.Put)("admin/trees/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tree_dto_1.UpdateTreeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Delete)("admin/trees/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TreesController.prototype, "deleteAdmin", null);
exports.TreesController = TreesController = TreesController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [trees_service_1.TreesService])
], TreesController);
//# sourceMappingURL=trees.controller.js.map