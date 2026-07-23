import {
    Controller, Get, Post, Put, Patch, Delete, Body, Param,
    UseGuards, Request, UseInterceptors, UploadedFile,
    ForbiddenException, NotFoundException,
    ParseIntPipe, Logger, Res,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { DOCUMENT_UPLOADS_DIR } from './documents.service';
import { DownloadRequestsService } from '../download-requests/download-requests.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { getStoredFilePayload } from '../../common/utils/db-file.util';
import { resolveStoredFilePath } from '../../common/utils/file.utils';
import { Response } from 'express';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';

const documentUploadOptions = {
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            fs.mkdirSync(DOCUMENT_UPLOADS_DIR, { recursive: true });
            cb(null, DOCUMENT_UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || '');
            cb(null, `document-${crypto.randomBytes(16).toString('hex')}${ext}`);
        },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
};

@Controller()
export class DocumentsController {
    private readonly logger = new Logger(DocumentsController.name);
    constructor(
        private readonly documentsService: DocumentsService,
        private readonly downloadRequestsService: DownloadRequestsService,
        private readonly subscriptionsService: SubscriptionsService,
    ) {}

    @Get('documents')
    async listPublic() {
        try {
            return await this.documentsService.listPublic();
        } catch (error) {
            this.logger.error(`listPublic failed: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }

    @Get('documents/:id')
    async getPublic(@Param('id', ParseIntPipe) id: number) {
        return this.documentsService.getPublic(id);
    }

    @Get('documents/:id/download')
    @UseGuards(JwtAuthGuard)
    async downloadPublic(@Param('id', ParseIntPipe) id: number, @Request() req, @Res() res: Response) {
        const doc = await this.documentsService.findOne(id);
        const userId = req.user?.id;
        const roleId = Number(req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0);
        const isOwner = doc.uploaded_by != null && Number(doc.uploaded_by) === Number(userId);
        const isAdmin = roleId === 1 || roleId === 3;
        if (!isOwner && !isAdmin) {
            const hasApprovedRequest =
                (await this.downloadRequestsService.hasApprovedAccess('document', id, userId)) ||
                (await this.subscriptionsService.hasFeature(userId, 'skip_download_requests'));
            if (!hasApprovedRequest) {
                throw new ForbiddenException('Downloading this document requires an approved download request.');
            }
        }

        const stored = getStoredFilePayload(
            doc as any,
            'file_data',
            'file_mime_type',
            'file_path',
            'application/octet-stream',
            'document-download',
        );
        if (stored) {
            res.type(stored.mimeType).attachment(stored.filename).send(stored.data);
            return;
        }

        const filePath = resolveStoredFilePath(doc.file_path);
        if (!filePath || !fs.existsSync(filePath)) throw new NotFoundException('File not found');
        res.download(filePath, path.basename(filePath));
    }

    @Get('my/documents')
    @UseGuards(JwtAuthGuard)
    async listMy(@Request() req) {
        return this.documentsService.listByUser(req.user.id);
    }

    @Post('my/documents')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', documentUploadOptions))
    async createMy(@Body() body: any, @Request() req, @UploadedFile() file?: Express.Multer.File) {
        return this.documentsService.create(body, req.user.id, file);
    }

    @Put('my/documents/:id')
    @Patch('my/documents/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', documentUploadOptions))
    async updateMy(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Request() req, @UploadedFile() file?: Express.Multer.File) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.documentsService.update(id, body, req.user.id, userRole, file);
    }

    @Delete('my/documents/:id')
    @UseGuards(JwtAuthGuard)
    async deleteMy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.documentsService.delete(id, req.user.id, userRole);
    }

    @Get('admin/documents')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async listAdmin() {
        return this.documentsService.listAdmin();
    }

    @Post('admin/documents')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    @UseInterceptors(FileInterceptor('file', documentUploadOptions))
    async createAdmin(@Body() body: any, @Request() req, @UploadedFile() file?: Express.Multer.File) {
        return this.documentsService.create(body, req.user.id, file);
    }

    @Put('admin/documents/:id')
    @Patch('admin/documents/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    @UseInterceptors(FileInterceptor('file', documentUploadOptions))
    async updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Request() req, @UploadedFile() file?: Express.Multer.File) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.documentsService.update(id, body, req.user.id, userRole, file);
    }

    @Delete('admin/documents/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async deleteAdmin(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.documentsService.delete(id, req.user.id, userRole);
    }
}
