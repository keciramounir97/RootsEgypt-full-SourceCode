import {
    Controller, Get, Post, Put, Patch, Delete, Body, Param,
    UseGuards, Request, UseInterceptors, UploadedFile,
    ForbiddenException, NotFoundException,
    ParseIntPipe, Logger, Res,
} from '@nestjs/common';
import { AudiosService } from './audios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AUDIO_UPLOADS_DIR } from './audios.service';
import { DownloadRequestsService } from '../download-requests/download-requests.service';
import { resolveStoredFilePath } from '../../common/utils/file.utils';
import { Response } from 'express';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';

const audioUploadOptions = {
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            fs.mkdirSync(AUDIO_UPLOADS_DIR, { recursive: true });
            cb(null, AUDIO_UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || '');
            cb(null, `audio-${crypto.randomBytes(16).toString('hex')}${ext}`);
        },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
};

@Controller()
export class AudiosController {
    private readonly logger = new Logger(AudiosController.name);
    constructor(
        private readonly audiosService: AudiosService,
        private readonly downloadRequestsService: DownloadRequestsService,
    ) {}

    @Get('audios')
    async listPublic() {
        try {
            return await this.audiosService.listPublic();
        } catch (error) {
            this.logger.error(`listPublic failed: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }

    @Get('audios/:id')
    async getPublic(@Param('id', ParseIntPipe) id: number) {
        return this.audiosService.getPublic(id);
    }

    @Get('audios/:id/download')
    @UseGuards(JwtAuthGuard)
    async downloadPublic(@Param('id', ParseIntPipe) id: number, @Request() req, @Res() res: Response) {
        const audio = await this.audiosService.findOne(id);
        const userId = req.user?.id;
        const roleId = Number(req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0);
        const isOwner = audio.uploaded_by != null && Number(audio.uploaded_by) === Number(userId);
        const isAdmin = roleId === 1 || roleId === 3;
        if (!isOwner && !isAdmin) {
            const hasApprovedRequest = await this.downloadRequestsService.hasApprovedAccess('audio', id, userId);
            if (!hasApprovedRequest) {
                throw new ForbiddenException('Downloading this audio requires an approved download request.');
            }
        }

        const filePath = resolveStoredFilePath(audio.audio_path);
        if (!filePath || !fs.existsSync(filePath)) throw new NotFoundException('File not found');
        res.download(filePath, path.basename(filePath));
    }

    @Get('my/audios')
    @UseGuards(JwtAuthGuard)
    async listMy(@Request() req) {
        return this.audiosService.listByUser(req.user.id);
    }

    @Post('my/audios')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('audio', audioUploadOptions))
    async createMy(@Body() body: any, @Request() req, @UploadedFile() file?: Express.Multer.File) {
        return this.audiosService.create(body, req.user.id, file);
    }

    @Put('my/audios/:id')
    @Patch('my/audios/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('audio', audioUploadOptions))
    async updateMy(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Request() req, @UploadedFile() file?: Express.Multer.File) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.audiosService.update(id, body, req.user.id, userRole, file);
    }

    @Delete('my/audios/:id')
    @UseGuards(JwtAuthGuard)
    async deleteMy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.audiosService.delete(id, req.user.id, userRole);
    }

    @Get('admin/audios')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async listAdmin() {
        return this.audiosService.listAdmin();
    }

    @Post('admin/audios')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    @UseInterceptors(FileInterceptor('audio', audioUploadOptions))
    async createAdmin(@Body() body: any, @Request() req, @UploadedFile() file?: Express.Multer.File) {
        return this.audiosService.create(body, req.user.id, file);
    }

    @Put('admin/audios/:id')
    @Patch('admin/audios/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    @UseInterceptors(FileInterceptor('audio', audioUploadOptions))
    async updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Request() req, @UploadedFile() file?: Express.Multer.File) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.audiosService.update(id, body, req.user.id, userRole, file);
    }

    @Delete('admin/audios/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async deleteAdmin(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.audiosService.delete(id, req.user.id, userRole);
    }
}
