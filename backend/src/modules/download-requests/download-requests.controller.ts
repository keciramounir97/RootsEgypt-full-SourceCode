import { Body, Controller, Get, Param, ParseIntPipe, Put, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DownloadRequestsService } from './download-requests.service';
import { CreateDownloadRequestDto } from './dto/download-request.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class DownloadRequestsController {
    constructor(private readonly downloadRequestsService: DownloadRequestsService) {}

    @Post('download-requests')
    async create(@Body() body: CreateDownloadRequestDto, @Request() req) {
        return this.downloadRequestsService.createRequest(body.contentType, body.contentId, req.user.id);
    }

    @Get('download-requests/mine')
    async listMine(@Query('status') status: string | undefined, @Request() req) {
        return this.downloadRequestsService.listForRequester(req.user.id, status);
    }

    @Get('download-requests/mine/status')
    async myStatus(
        @Query('contentType') contentType: string,
        @Query('contentId') contentId: string,
        @Request() req,
    ) {
        return this.downloadRequestsService.myRequestStatus(contentType, Number(contentId), req.user.id);
    }

    @Get('my/download-requests')
    async listForMyContent(@Query('status') status: string | undefined, @Request() req) {
        return this.downloadRequestsService.listForOwner(req.user.id, status);
    }

    @Put('my/download-requests/:id/approve')
    async approveMine(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.downloadRequestsService.approveAsOwner(id, req.user.id);
    }

    @Put('my/download-requests/:id/reject')
    async rejectMine(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.downloadRequestsService.rejectAsOwner(id, req.user.id);
    }
}

@Controller('admin/download-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class AdminDownloadRequestsController {
    constructor(private readonly downloadRequestsService: DownloadRequestsService) {}

    @Get()
    async listAdmin(@Query('status') status: string | undefined) {
        return this.downloadRequestsService.listForAdmin(status);
    }

    @Put(':id/approve')
    async approve(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.downloadRequestsService.approveAsAdmin(id, req.user.id);
    }

    @Put(':id/reject')
    async reject(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.downloadRequestsService.rejectAsAdmin(id, req.user.id);
    }
}
