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
exports.UserRequestsController = exports.ApprovalsController = void 0;
const common_1 = require("@nestjs/common");
const approvals_service_1 = require("./approvals.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ApprovalsController = class ApprovalsController {
    constructor(approvalsService) {
        this.approvalsService = approvalsService;
    }
    async getStats() {
        return this.approvalsService.getStats();
    }
    async getPasswordResetRequests(status) {
        return this.approvalsService.findAllPasswordResetRequests(status);
    }
    async approvePasswordReset(id, req) {
        return this.approvalsService.approvePasswordReset(id, req.user.userId);
    }
    async rejectPasswordReset(id, req) {
        return this.approvalsService.rejectPasswordReset(id, req.user.userId);
    }
    async getAccountDeletionRequests(status) {
        return this.approvalsService.findAllAccountDeletionRequests(status);
    }
    async approveAccountDeletion(id, req) {
        return this.approvalsService.approveAccountDeletion(id, req.user.userId);
    }
    async rejectAccountDeletion(id, req) {
        return this.approvalsService.rejectAccountDeletion(id, req.user.userId);
    }
};
exports.ApprovalsController = ApprovalsController;
__decorate([
    (0, common_1.Get)("stats"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)("password-reset"),
    __param(0, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "getPasswordResetRequests", null);
__decorate([
    (0, common_1.Put)("password-reset/:id/approve"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "approvePasswordReset", null);
__decorate([
    (0, common_1.Put)("password-reset/:id/reject"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "rejectPasswordReset", null);
__decorate([
    (0, common_1.Get)("account-deletion"),
    __param(0, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "getAccountDeletionRequests", null);
__decorate([
    (0, common_1.Put)("account-deletion/:id/approve"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "approveAccountDeletion", null);
__decorate([
    (0, common_1.Put)("account-deletion/:id/reject"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "rejectAccountDeletion", null);
exports.ApprovalsController = ApprovalsController = __decorate([
    (0, common_1.Controller)("admin/approvals"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("super_admin"),
    __metadata("design:paramtypes", [approvals_service_1.ApprovalsService])
], ApprovalsController);
let UserRequestsController = class UserRequestsController {
    constructor(approvalsService) {
        this.approvalsService = approvalsService;
    }
    async requestPasswordReset(req) {
        return this.approvalsService.createPasswordResetRequest(req.user.id, req.user.email);
    }
    async requestAccountDeletion(reason, req) {
        return this.approvalsService.createAccountDeletionRequest(req.user.id, req.user.email, reason);
    }
};
exports.UserRequestsController = UserRequestsController;
__decorate([
    (0, common_1.Post)("password-reset"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserRequestsController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)("account-deletion"),
    __param(0, (0, common_1.Body)("reason")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserRequestsController.prototype, "requestAccountDeletion", null);
exports.UserRequestsController = UserRequestsController = __decorate([
    (0, common_1.Controller)("user/requests"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [approvals_service_1.ApprovalsService])
], UserRequestsController);
//# sourceMappingURL=approvals.controller.js.map