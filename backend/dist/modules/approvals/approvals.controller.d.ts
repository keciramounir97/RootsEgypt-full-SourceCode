import { ApprovalsService } from './approvals.service';
import { Request as ExpressRequest } from "express";
export declare class ApprovalsController {
    private readonly approvalsService;
    constructor(approvalsService: ApprovalsService);
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
    getPasswordResetRequests(status?: string): Promise<import("../../models/PasswordResetRequest").PasswordResetRequest[]>;
    approvePasswordReset(id: number, req: ExpressRequest): Promise<{
        message: string;
        resetLink: string;
    }>;
    rejectPasswordReset(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
    getAccountDeletionRequests(status?: string): Promise<import("../../models/AccountDeletionRequest").AccountDeletionRequest[]>;
    approveAccountDeletion(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
    rejectAccountDeletion(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
}
export declare class UserRequestsController {
    private readonly approvalsService;
    constructor(approvalsService: ApprovalsService);
    requestPasswordReset(req: ExpressRequest): Promise<import("../../models/PasswordResetRequest").PasswordResetRequest>;
    requestAccountDeletion(reason: string, req: ExpressRequest): Promise<import("../../models/AccountDeletionRequest").AccountDeletionRequest>;
}
