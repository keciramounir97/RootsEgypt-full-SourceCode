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
exports.SuggestionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const suggestions_service_1 = require("./suggestions.service");
const suggestion_dto_1 = require("./dto/suggestion.dto");
let SuggestionsController = class SuggestionsController {
    constructor(suggestionsService) {
        this.suggestionsService = suggestionsService;
    }
    async create(body) {
        return this.suggestionsService.create(body);
    }
    async listPublic() {
        return this.suggestionsService.listPublic();
    }
    async listAdmin() {
        return this.suggestionsService.listAdmin();
    }
    async patchStatus(id, body, req) {
        const status = String((body === null || body === void 0 ? void 0 : body.status) || '').toLowerCase();
        if (status === 'approved')
            return this.suggestionsService.updateStatus(id, 'approved', req.user.id);
        return this.suggestionsService.updateStatus(id, 'rejected', req.user.id);
    }
    async approve(id, req) {
        return this.suggestionsService.updateStatus(id, 'approved', req.user.id);
    }
    async approvePost(id, req) {
        return this.suggestionsService.updateStatus(id, 'approved', req.user.id);
    }
    async approveLegacy(id, req) {
        return this.suggestionsService.updateStatus(id, 'approved', req.user.id);
    }
    async reject(id, req) {
        return this.suggestionsService.updateStatus(id, 'rejected', req.user.id);
    }
    async rejectPost(id, req) {
        return this.suggestionsService.updateStatus(id, 'rejected', req.user.id);
    }
    async rejectLegacy(id, req) {
        return this.suggestionsService.updateStatus(id, 'rejected', req.user.id);
    }
};
exports.SuggestionsController = SuggestionsController;
__decorate([
    (0, common_1.Post)('suggestions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [suggestion_dto_1.CreateSuggestionDto]),
    __metadata("design:returntype", Promise)
], SuggestionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuggestionsController.prototype, "listPublic", null);
__decorate([
    (0, common_1.Get)('admin/suggestions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuggestionsController.prototype, "listAdmin", null);
__decorate([
    (0, common_1.Patch)('admin/suggestions/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], SuggestionsController.prototype, "patchStatus", null);
__decorate([
    (0, common_1.Put)('admin/suggestions/:id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SuggestionsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('admin/suggestions/:id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SuggestionsController.prototype, "approvePost", null);
__decorate([
    (0, common_1.Post)('suggestions/:id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SuggestionsController.prototype, "approveLegacy", null);
__decorate([
    (0, common_1.Put)('admin/suggestions/:id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SuggestionsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)('admin/suggestions/:id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SuggestionsController.prototype, "rejectPost", null);
__decorate([
    (0, common_1.Post)('suggestions/:id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SuggestionsController.prototype, "rejectLegacy", null);
exports.SuggestionsController = SuggestionsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [suggestions_service_1.SuggestionsService])
], SuggestionsController);
//# sourceMappingURL=suggestions.controller.js.map