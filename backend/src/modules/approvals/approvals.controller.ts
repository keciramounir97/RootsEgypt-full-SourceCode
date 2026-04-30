import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class ApprovalsController {
    constructor(private readonly approvalsService: ApprovalsService) { }

    // ==================== STATS ====================
    @Get('stats')
    async getStats() {
        return this.approvalsService.getStats();
    }

    // ==================== PASSWORD RESET REQUESTS ====================
    @Get('password-reset')
    async getPasswordResetRequests(@Query('status') status?: string) {
        return this.approvalsService.findAllPasswordResetRequests(status);
    }

    @Put('password-reset/:id/approve')
    async approvePasswordReset(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {
        return this.approvalsService.approvePasswordReset(id, req.user.userId);
    }

    @Put('password-reset/:id/reject')
    async rejectPasswordReset(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {
        return this.approvalsService.rejectPasswordReset(id, req.user.userId);
    }

    // ==================== ACCOUNT DELETION REQUESTS ====================
    @Get('account-deletion')
    async getAccountDeletionRequests(@Query('status') status?: string) {
        return this.approvalsService.findAllAccountDeletionRequests(status);
    }

    @Put('account-deletion/:id/approve')
    async approveAccountDeletion(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {
        return this.approvalsService.approveAccountDeletion(id, req.user.userId);
    }

    @Put('account-deletion/:id/reject')
    async rejectAccountDeletion(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {
        return this.approvalsService.rejectAccountDeletion(id, req.user.userId);
    }
}

// User-facing endpoints (no admin role required)
@Controller('user/requests')
@UseGuards(JwtAuthGuard)
export class UserRequestsController {
    constructor(private readonly approvalsService: ApprovalsService) { }

    @Post('password-reset')
    async requestPasswordReset(@Request() req) {
        return this.approvalsService.createPasswordResetRequest(
          req.user.id,
          req.user.email,
        );
    }

    @Post('account-deletion')
    async requestAccountDeletion(
        @Body('reason') reason: string,
        @Request() req,
    ) {
        return this.approvalsService.createAccountDeletionRequest(
          req.user.id,
          req.user.email,
          reason,
        );
    }
}
