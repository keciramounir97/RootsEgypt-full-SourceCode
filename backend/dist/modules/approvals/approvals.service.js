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
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const PasswordResetRequest_1 = require("../../models/PasswordResetRequest");
const AccountDeletionRequest_1 = require("../../models/AccountDeletionRequest");
const User_1 = require("../../models/User");
const activity_service_1 = require("../activity/activity.service");
const crypto = require("crypto");
const mailer_service_1 = require("../../common/mailer/mailer.service");
const config_1 = require("@nestjs/config");
let ApprovalsService = class ApprovalsService {
    constructor(knex, activityService, mailerService, configService) {
        this.knex = knex;
        this.activityService = activityService;
        this.mailerService = mailerService;
        this.configService = configService;
    }
    getFrontendBaseUrl() {
        return String(this.configService.get("FRONTEND_URL") ||
            "https://rootsegypt.org").replace(/\/+$/, "");
    }
    async sendUserEmail(to, subject, html, text) {
        const from = this.configService.get("EMAIL_FROM") ||
            this.configService.get("SMTP_USER");
        if (!from)
            return;
        await this.mailerService.sendMail({
            from,
            to,
            subject,
            html,
            text,
        });
    }
    async findAllPasswordResetRequests(status) {
        const query = PasswordResetRequest_1.PasswordResetRequest.query(this.knex)
            .select("password_reset_requests.*", "u.full_name as userFullName", "p.full_name as processorFullName")
            .leftJoin("users as u", "password_reset_requests.user_id", "u.id")
            .leftJoin("users as p", "password_reset_requests.processed_by", "p.id")
            .orderBy("password_reset_requests.requested_at", "desc");
        if (status && status !== "all") {
            query.where("password_reset_requests.status", status);
        }
        return query;
    }
    async createPasswordResetRequest(userId, email) {
        const existing = await PasswordResetRequest_1.PasswordResetRequest.query(this.knex)
            .where("user_id", userId)
            .where("status", "pending")
            .first();
        if (existing) {
            throw new common_1.BadRequestException("You already have a pending password reset request");
        }
        const request = await PasswordResetRequest_1.PasswordResetRequest.query(this.knex).insertAndFetch({
            user_id: userId,
            email: email,
            status: "pending",
        });
        await this.activityService.log(null, "security", `Password reset requested by: ${email}`);
        return request;
    }
    async approvePasswordReset(requestId, adminId) {
        const request = await PasswordResetRequest_1.PasswordResetRequest.query(this.knex).findById(requestId);
        if (!request)
            throw new common_1.NotFoundException("Request not found");
        if (request.status !== "pending")
            throw new common_1.BadRequestException("Request is not pending");
        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiresAt = new Date();
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);
        await PasswordResetRequest_1.PasswordResetRequest.query(this.knex)
            .patch({
            status: "approved",
            processed_by: adminId,
            processed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
            reset_token: resetToken,
            token_expires_at: tokenExpiresAt
                .toISOString()
                .slice(0, 19)
                .replace("T", " "),
        })
            .where("id", requestId);
        await this.activityService.log(adminId, "security", `Approved password reset for: ${request.email}`);
        const resetLink = `${this.getFrontendBaseUrl()}/resetpassword?token=${resetToken}&email=${encodeURIComponent(request.email)}`;
        await this.sendUserEmail(request.email, "RootsEgypt password reset approved", `<p>Your password reset request has been approved.</p><p>Set a new password using this secure link:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 24 hours.</p>`, `Your password reset request has been approved. Set a new password here: ${resetLink}. This link expires in 24 hours.`);
        return {
            message: "Password reset approved",
            resetLink,
        };
    }
    async rejectPasswordReset(requestId, adminId) {
        const request = await PasswordResetRequest_1.PasswordResetRequest.query(this.knex).findById(requestId);
        if (!request)
            throw new common_1.NotFoundException("Request not found");
        if (request.status !== "pending")
            throw new common_1.BadRequestException("Request is not pending");
        await PasswordResetRequest_1.PasswordResetRequest.query(this.knex)
            .patch({
            status: "rejected",
            processed_by: adminId,
            processed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        })
            .where("id", requestId);
        await this.activityService.log(adminId, "security", `Rejected password reset for: ${request.email}`);
        await this.sendUserEmail(request.email, "RootsEgypt password reset request rejected", "<p>Your password reset request was not approved. Please contact support if this was unexpected.</p>", "Your password reset request was not approved. Please contact support if this was unexpected.");
        return { message: "Password reset request rejected" };
    }
    async findAllAccountDeletionRequests(status) {
        const query = AccountDeletionRequest_1.AccountDeletionRequest.query(this.knex)
            .select("account_deletion_requests.*", "u.full_name as userFullName", "p.full_name as processorFullName")
            .leftJoin("users as u", "account_deletion_requests.user_id", "u.id")
            .leftJoin("users as p", "account_deletion_requests.processed_by", "p.id")
            .orderBy("account_deletion_requests.requested_at", "desc");
        if (status && status !== "all") {
            query.where("account_deletion_requests.status", status);
        }
        return query;
    }
    async createAccountDeletionRequest(userId, email, reason) {
        const existing = await AccountDeletionRequest_1.AccountDeletionRequest.query(this.knex)
            .where("user_id", userId)
            .where("status", "pending")
            .first();
        if (existing) {
            throw new common_1.BadRequestException("You already have a pending account deletion request");
        }
        const request = await AccountDeletionRequest_1.AccountDeletionRequest.query(this.knex).insertAndFetch({
            user_id: userId,
            email: email,
            reason: reason || null,
            status: "pending",
        });
        await this.activityService.log(null, "security", `Account deletion requested by: ${email}`);
        return request;
    }
    async approveAccountDeletion(requestId, adminId) {
        const request = await AccountDeletionRequest_1.AccountDeletionRequest.query(this.knex).findById(requestId);
        if (!request)
            throw new common_1.NotFoundException("Request not found");
        if (request.status !== "pending")
            throw new common_1.BadRequestException("Request is not pending");
        const user = await User_1.User.query(this.knex).findById(request.user_id);
        if (!user)
            throw new common_1.NotFoundException("User not found");
        await User_1.User.query(this.knex).deleteById(request.user_id);
        await AccountDeletionRequest_1.AccountDeletionRequest.query(this.knex)
            .patch({
            status: "approved",
            processed_by: adminId,
            processed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        })
            .where("id", requestId);
        await this.activityService.log(adminId, "security", `Approved and executed account deletion for: ${request.email}`);
        await this.sendUserEmail(request.email, "RootsEgypt account deletion approved", "<p>Your account deletion request has been approved and completed.</p>", "Your account deletion request has been approved and completed.");
        return { message: "Account deleted successfully" };
    }
    async rejectAccountDeletion(requestId, adminId) {
        const request = await AccountDeletionRequest_1.AccountDeletionRequest.query(this.knex).findById(requestId);
        if (!request)
            throw new common_1.NotFoundException("Request not found");
        if (request.status !== "pending")
            throw new common_1.BadRequestException("Request is not pending");
        await AccountDeletionRequest_1.AccountDeletionRequest.query(this.knex)
            .patch({
            status: "rejected",
            processed_by: adminId,
            processed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        })
            .where("id", requestId);
        await this.activityService.log(adminId, "security", `Rejected account deletion for: ${request.email}`);
        await this.sendUserEmail(request.email, "RootsEgypt account deletion request rejected", "<p>Your account deletion request was not approved.</p>", "Your account deletion request was not approved.");
        return { message: "Account deletion request rejected" };
    }
    async getStats() {
        const [passwordPending, passwordApproved, passwordRejected] = await Promise.all([
            PasswordResetRequest_1.PasswordResetRequest.query(this.knex)
                .where("status", "pending")
                .resultSize(),
            PasswordResetRequest_1.PasswordResetRequest.query(this.knex)
                .where("status", "approved")
                .resultSize(),
            PasswordResetRequest_1.PasswordResetRequest.query(this.knex)
                .where("status", "rejected")
                .resultSize(),
        ]);
        const [deletionPending, deletionApproved, deletionRejected] = await Promise.all([
            AccountDeletionRequest_1.AccountDeletionRequest.query(this.knex)
                .where("status", "pending")
                .resultSize(),
            AccountDeletionRequest_1.AccountDeletionRequest.query(this.knex)
                .where("status", "approved")
                .resultSize(),
            AccountDeletionRequest_1.AccountDeletionRequest.query(this.knex)
                .where("status", "rejected")
                .resultSize(),
        ]);
        return {
            passwordReset: {
                pending: passwordPending,
                approved: passwordApproved,
                rejected: passwordRejected,
            },
            accountDeletion: {
                pending: deletionPending,
                approved: deletionApproved,
                rejected: deletionRejected,
            },
        };
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("KnexConnection")),
    __metadata("design:paramtypes", [Object, activity_service_1.ActivityService,
        mailer_service_1.MailerService,
        config_1.ConfigService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map