import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PasswordResetRequest } from "../../models/PasswordResetRequest";
import { AccountDeletionRequest } from "../../models/AccountDeletionRequest";
import { User } from "../../models/User";
import { ActivityService } from "../activity/activity.service";
import * as crypto from "crypto";
import { MailerService } from "../../common/mailer/mailer.service";
import { ConfigService } from "@nestjs/config";
import { Knex } from "knex";

@Injectable()
export class ApprovalsService {
  constructor(
    @Inject("KnexConnection") private readonly knex: Knex,
    private readonly activityService: ActivityService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private getFrontendBaseUrl(): string {
    return String(
      this.configService.get<string>("FRONTEND_URL") ||
        "https://rootsegypt.org",
    ).replace(/\/+$/, "");
  }

  private async sendUserEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ) {
    const from =
      this.configService.get<string>("EMAIL_FROM") ||
      this.configService.get<string>("SMTP_USER");
    if (!from) return;
    await this.mailerService.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });
  }

  // ==================== PASSWORD RESET REQUESTS ====================

  async findAllPasswordResetRequests(status?: string) {
    const query = PasswordResetRequest.query(this.knex)
      .select(
        "password_reset_requests.*",
        "u.full_name as userFullName",
        "p.full_name as processorFullName",
      )
      .leftJoin("users as u", "password_reset_requests.user_id", "u.id")
      .leftJoin("users as p", "password_reset_requests.processed_by", "p.id")
      .orderBy("password_reset_requests.requested_at", "desc");

    if (status && status !== "all") {
      query.where("password_reset_requests.status", status);
    }

    return query;
  }

  async createPasswordResetRequest(userId: number, email: string) {
    // Check if there's already a pending request
    const existing = await PasswordResetRequest.query(this.knex)
      .where("user_id", userId)
      .where("status", "pending")
      .first();

    if (existing) {
      throw new BadRequestException(
        "You already have a pending password reset request",
      );
    }

    const request = await PasswordResetRequest.query(this.knex).insertAndFetch({
      user_id: userId,
      email: email,
      status: "pending",
    });

    // Log to activity for super admin notification
    await this.activityService.log(
      null,
      "security",
      `Password reset requested by: ${email}`,
    );

    return request;
  }

  async approvePasswordReset(requestId: number, adminId: number) {
    const request = await PasswordResetRequest.query(this.knex).findById(
      requestId,
    );
    if (!request) throw new NotFoundException("Request not found");
    if (request.status !== "pending")
      throw new BadRequestException("Request is not pending");

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24); // 24 hour expiry

    await PasswordResetRequest.query(this.knex)
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

    // Log activity
    await this.activityService.log(
      adminId,
      "security",
      `Approved password reset for: ${request.email}`,
    );

    const resetLink = `${this.getFrontendBaseUrl()}/resetpassword?token=${resetToken}&email=${encodeURIComponent(request.email)}`;
    await this.sendUserEmail(
      request.email,
      "RootsEgypt password reset approved",
      `<p>Your password reset request has been approved.</p><p>Set a new password using this secure link:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 24 hours.</p>`,
      `Your password reset request has been approved. Set a new password here: ${resetLink}. This link expires in 24 hours.`,
    );

    return {
      message: "Password reset approved",
      resetLink,
    };
  }

  async rejectPasswordReset(requestId: number, adminId: number) {
    const request = await PasswordResetRequest.query(this.knex).findById(
      requestId,
    );
    if (!request) throw new NotFoundException("Request not found");
    if (request.status !== "pending")
      throw new BadRequestException("Request is not pending");

    await PasswordResetRequest.query(this.knex)
      .patch({
        status: "rejected",
        processed_by: adminId,
        processed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      })
      .where("id", requestId);

    await this.activityService.log(
      adminId,
      "security",
      `Rejected password reset for: ${request.email}`,
    );
    await this.sendUserEmail(
      request.email,
      "RootsEgypt password reset request rejected",
      "<p>Your password reset request was not approved. Please contact support if this was unexpected.</p>",
      "Your password reset request was not approved. Please contact support if this was unexpected.",
    );

    return { message: "Password reset request rejected" };
  }

  // ==================== ACCOUNT DELETION REQUESTS ====================

  async findAllAccountDeletionRequests(status?: string) {
    const query = AccountDeletionRequest.query(this.knex)
      .select(
        "account_deletion_requests.*",
        "u.full_name as userFullName",
        "p.full_name as processorFullName",
      )
      .leftJoin("users as u", "account_deletion_requests.user_id", "u.id")
      .leftJoin("users as p", "account_deletion_requests.processed_by", "p.id")
      .orderBy("account_deletion_requests.requested_at", "desc");

    if (status && status !== "all") {
      query.where("account_deletion_requests.status", status);
    }

    return query;
  }

  async createAccountDeletionRequest(
    userId: number,
    email: string,
    reason?: string,
  ) {
    // Check if there's already a pending request
    const existing = await AccountDeletionRequest.query(this.knex)
      .where("user_id", userId)
      .where("status", "pending")
      .first();

    if (existing) {
      throw new BadRequestException(
        "You already have a pending account deletion request",
      );
    }

    const request = await AccountDeletionRequest.query(
      this.knex,
    ).insertAndFetch({
      user_id: userId,
      email: email,
      reason: reason || null,
      status: "pending",
    });

    // Log to activity for super admin notification
    await this.activityService.log(
      null,
      "security",
      `Account deletion requested by: ${email}`,
    );

    return request;
  }

  async approveAccountDeletion(requestId: number, adminId: number) {
    const request = await AccountDeletionRequest.query(this.knex).findById(
      requestId,
    );
    if (!request) throw new NotFoundException("Request not found");
    if (request.status !== "pending")
      throw new BadRequestException("Request is not pending");

    const user = await User.query(this.knex).findById(request.user_id);
    if (!user) throw new NotFoundException("User not found");

    // Delete the user (soft delete or hard delete - doing hard delete for now)
    await User.query(this.knex).deleteById(request.user_id);

    await AccountDeletionRequest.query(this.knex)
      .patch({
        status: "approved",
        processed_by: adminId,
        processed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      })
      .where("id", requestId);

    await this.activityService.log(
      adminId,
      "security",
      `Approved and executed account deletion for: ${request.email}`,
    );
    await this.sendUserEmail(
      request.email,
      "RootsEgypt account deletion approved",
      "<p>Your account deletion request has been approved and completed.</p>",
      "Your account deletion request has been approved and completed.",
    );

    return { message: "Account deleted successfully" };
  }

  async rejectAccountDeletion(requestId: number, adminId: number) {
    const request = await AccountDeletionRequest.query(this.knex).findById(
      requestId,
    );
    if (!request) throw new NotFoundException("Request not found");
    if (request.status !== "pending")
      throw new BadRequestException("Request is not pending");

    await AccountDeletionRequest.query(this.knex)
      .patch({
        status: "rejected",
        processed_by: adminId,
        processed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      })
      .where("id", requestId);

    await this.activityService.log(
      adminId,
      "security",
      `Rejected account deletion for: ${request.email}`,
    );
    await this.sendUserEmail(
      request.email,
      "RootsEgypt account deletion request rejected",
      "<p>Your account deletion request was not approved.</p>",
      "Your account deletion request was not approved.",
    );

    return { message: "Account deletion request rejected" };
  }

  // ==================== STATS ====================

  async getStats() {
    const [passwordPending, passwordApproved, passwordRejected] =
      await Promise.all([
        PasswordResetRequest.query(this.knex)
          .where("status", "pending")
          .resultSize(),
        PasswordResetRequest.query(this.knex)
          .where("status", "approved")
          .resultSize(),
        PasswordResetRequest.query(this.knex)
          .where("status", "rejected")
          .resultSize(),
      ]);

    const [deletionPending, deletionApproved, deletionRejected] =
      await Promise.all([
        AccountDeletionRequest.query(this.knex)
          .where("status", "pending")
          .resultSize(),
        AccountDeletionRequest.query(this.knex)
          .where("status", "approved")
          .resultSize(),
        AccountDeletionRequest.query(this.knex)
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
}
