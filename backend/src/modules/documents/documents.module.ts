import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService, DOCUMENT_UPLOADS_DIR } from './documents.service';
import { ActivityModule } from '../activity/activity.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';

if (!fs.existsSync(DOCUMENT_UPLOADS_DIR)) {
    fs.mkdirSync(DOCUMENT_UPLOADS_DIR, { recursive: true });
}

@Module({
    imports: [
        ActivityModule,
        MulterModule.register({
            storage: multer.diskStorage({
                destination: (_req, _file, cb) => cb(null, DOCUMENT_UPLOADS_DIR),
                filename: (_req, file, cb) => {
                    const ext = path.extname(file.originalname || '');
                    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
                },
            }),
            limits: { fileSize: 50 * 1024 * 1024 },
        }),
    ],
    controllers: [DocumentsController],
    providers: [DocumentsService],
    exports: [DocumentsService],
})
export class DocumentsModule {}
