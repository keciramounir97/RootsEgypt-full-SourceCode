import { Module } from '@nestjs/common';
import { AudiosController } from './audios.controller';
import { AudiosService, AUDIO_UPLOADS_DIR } from './audios.service';
import { ActivityModule } from '../activity/activity.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';

if (!fs.existsSync(AUDIO_UPLOADS_DIR)) {
    fs.mkdirSync(AUDIO_UPLOADS_DIR, { recursive: true });
}

@Module({
    imports: [
        ActivityModule,
        MulterModule.register({
            storage: multer.diskStorage({
                destination: (_req, _file, cb) => cb(null, AUDIO_UPLOADS_DIR),
                filename: (_req, file, cb) => {
                    const ext = path.extname(file.originalname || '');
                    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
                },
            }),
            limits: { fileSize: 100 * 1024 * 1024 },
        }),
    ],
    controllers: [AudiosController],
    providers: [AudiosService],
    exports: [AudiosService],
})
export class AudiosModule {}
