import { ApprovalsService } from './approvals.service';
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
    approvePasswordReset(id: number, req: any): Promise<{
        message: string;
        resetLink: string;
    }>;
    rejectPasswordReset(id: number, req: any): Promise<{
        message: string;
    }>;
    getAccountDeletionRequests(status?: string): Promise<import("../../models/AccountDeletionRequest").AccountDeletionRequest[]>;
    approveAccountDeletion(id: number, req: any): Promise<{
        message: string;
    }>;
    rejectAccountDeletion(id: number, req: any): Promise<{
        message: string;
    }>;
}
export declare class UserRequestsController {
    private readonly approvalsService;
    constructor(approvalsService: ApprovalsService);
    requestPasswordReset(req: any): Promise<import("../../models/PasswordResetRequest").PasswordResetRequest>;
    requestAccountDeletion(reason: string, req: any): Promise<import("../../models/AccountDeletionRequest").AccountDeletionRequest>;
}
