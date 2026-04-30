import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('activity')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Get()
    async getActivities(
        @Query('limit') limit: number,
        @Query('type') type?: string,
        @Query('q') q?: string,
    ) {
        return this.activityService.findAll(limit || 50, type, q);
    }
}
