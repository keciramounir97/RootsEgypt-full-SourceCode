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
var BooksController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksController = void 0;
const common_1 = require("@nestjs/common");
const books_service_1 = require("./books.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const fs = require("fs");
const path = require("path");
const book_dto_1 = require("./dto/book.dto");
let BooksController = BooksController_1 = class BooksController {
    constructor(booksService) {
        this.booksService = booksService;
        this.logger = new common_1.Logger(BooksController_1.name);
    }
    async listPublic() {
        try {
            return await this.booksService.listPublic();
        }
        catch (error) {
            this.logger.error(`listPublic failed: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
            return [];
        }
    }
    async getPublic(id) {
        return this.booksService.getPublic(id);
    }
    async downloadPublic(id, res) {
        const book = await this.booksService.getPublic(id);
        if (!book.is_public)
            throw new common_1.ForbiddenException("Not public");
        const filePath = this.booksService.getFilePath(book);
        if (!filePath || !fs.existsSync(filePath))
            throw new common_1.NotFoundException("File not found");
        await this.booksService.incrementDownload(id);
        res.download(filePath, path.basename(filePath));
    }
    async listMy(req) {
        return this.booksService.listByUser(req.user.id);
    }
    async getMy(id, req) {
        const book = await this.booksService.findOne(id);
        if (book.uploaded_by !== req.user.id)
            throw new common_1.ForbiddenException();
        return book;
    }
    async createMy(body, req, files) {
        return this.booksService.create(body, req.user.id, files);
    }
    async updateMy(id, body, req, files) {
        var _a, _b, _c, _d, _e, _f;
        const userRole = Number((_f = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : 0);
        return this.booksService.update(id, body, req.user.id, userRole, files);
    }
    async deleteMy(id, req) {
        var _a, _b, _c, _d, _e, _f;
        const userRole = Number((_f = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : 0);
        return this.booksService.delete(id, req.user.id, userRole);
    }
    async downloadMy(id, res, req) {
        const book = await this.booksService.findOne(id);
        if (book.uploaded_by !== req.user.id)
            throw new common_1.ForbiddenException();
        const filePath = this.booksService.getFilePath(book);
        if (!filePath || !fs.existsSync(filePath))
            throw new common_1.NotFoundException("File not found");
        await this.booksService.incrementDownload(id);
        res.download(filePath, path.basename(filePath));
    }
    async listAdmin() {
        return this.booksService.listAdmin();
    }
    async getAdmin(id) {
        return this.booksService.findOne(id);
    }
    async createAdmin(body, req, files) {
        return this.booksService.create(body, req.user.id, files);
    }
    async updateAdmin(id, body, req, files) {
        var _a, _b, _c, _d, _e, _f;
        const userRole = Number((_f = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : 0);
        return this.booksService.update(id, body, req.user.id, userRole, files);
    }
    async deleteAdmin(id, req) {
        var _a, _b, _c, _d, _e, _f;
        const userRole = Number((_f = (_d = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.roleId) !== null && _d !== void 0 ? _d : (_e = req.user) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : 0);
        return this.booksService.delete(id, req.user.id, userRole);
    }
};
exports.BooksController = BooksController;
__decorate([
    (0, common_1.Get)("books"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "listPublic", null);
__decorate([
    (0, common_1.Get)("books/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "getPublic", null);
__decorate([
    (0, common_1.Get)("books/:id/download"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "downloadPublic", null);
__decorate([
    (0, common_1.Get)("my/books"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "listMy", null);
__decorate([
    (0, common_1.Get)("my/books/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "getMy", null);
__decorate([
    (0, common_1.Post)("my/books"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: "file", maxCount: 1 },
        { name: "cover", maxCount: 1 },
    ])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [book_dto_1.CreateBookDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "createMy", null);
__decorate([
    (0, common_1.Put)("my/books/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: "file", maxCount: 1 },
        { name: "cover", maxCount: 1 },
    ])),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, book_dto_1.UpdateBookDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "updateMy", null);
__decorate([
    (0, common_1.Delete)("my/books/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "deleteMy", null);
__decorate([
    (0, common_1.Get)("my/books/:id/download"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "downloadMy", null);
__decorate([
    (0, common_1.Get)("admin/books"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "listAdmin", null);
__decorate([
    (0, common_1.Get)("admin/books/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "getAdmin", null);
__decorate([
    (0, common_1.Post)("admin/books"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: "file", maxCount: 1 },
        { name: "cover", maxCount: 1 },
    ])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [book_dto_1.CreateBookDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Put)("admin/books/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: "file", maxCount: 1 },
        { name: "cover", maxCount: 1 },
    ])),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, book_dto_1.UpdateBookDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Delete)("admin/books/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BooksController.prototype, "deleteAdmin", null);
exports.BooksController = BooksController = BooksController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [books_service_1.BooksService])
], BooksController);
//# sourceMappingURL=books.controller.js.map