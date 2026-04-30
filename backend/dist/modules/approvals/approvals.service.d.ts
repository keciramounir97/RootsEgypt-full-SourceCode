import { PasswordResetRequest } from "../../models/PasswordResetRequest";
import { AccountDeletionRequest } from "../../models/AccountDeletionRequest";
import { ActivityService } from "../activity/activity.service";
import { MailerService } from "../../common/mailer/mailer.service";
import { ConfigService } from "@nestjs/config";
import { Knex } from "knex";
export declare class ApprovalsService {
    private readonly knex;
    private readonly activityService;
    private readonly mailerService;
    private readonly configService;
    constructor(knex: Knex, activityService: ActivityService, mailerService: MailerService, configService: ConfigService);
    private getFrontendBaseUrl;
    private sendUserEmail;
    findAllPasswordResetRequests(status?: string): Promise<PasswordResetRequest[]>;
    createPasswordResetRequest(userId: number, email: string): Promise<PasswordResetRequest>;
    approvePasswordReset(requestId: number, adminId: number): Promise<{
        message: string;
        resetLink: string;
    }>;
    rejectPasswordReset(requestId: number, adminId: number): Promise<{
        message: string;
    }>;
    findAllAccountDeletionRequests(status?: string): Promise<AccountDeletionRequest[]>;
    createAccountDeletionRequest(userId: number, email: string, reason?: string): Promise<AccountDeletionRequest>;
    approveAccountDeletion(requestId: number, adminId: number): Promise<{
        message: string;
    }>;
    rejectAccountDeletion(requestId: number, adminId: number): Promise<{
        message: string;
    }>;
    getStats(): Promise<{
        passwordReset: {
            pending: number;
            approved: number;
            rejected: number;
        };
        accountDeletion: {
            pending: number;
            approved: number;
            rejected: number;
        };
    }>;
}
