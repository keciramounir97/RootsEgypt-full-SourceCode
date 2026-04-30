import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { ActivityModule } from '../activity/activity.module';
import { MulterModule } from '@nestjs/platform-express';
import { BOOK_UPLOADS_DIR } from '../../common/utils/file.utils'; // fixed import path
import * as multer from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';

@Module({
    imports: [
        ActivityModule,
        MulterModule.register({
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, BOOK_UPLOADS_DIR);
                },
                filename: (req, file, cb) => {
                    const ext = path.extname(file.originalname || '');
                    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
                },
            }),
            limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
        }),
    ],
    controllers: [BooksController],
    providers: [BooksService],
    exports: [BooksService],
})
export class BooksModule { }
