import { Module } from '@nestjs/common';
import { TreesController } from './trees.controller';
import { PersonsController } from './persons.controller';
import { TreesService } from './trees.service';
import { ActivityModule } from '../activity/activity.module';
import { MulterModule } from '@nestjs/platform-express';
import { TREE_UPLOADS_DIR } from '../../common/utils/file.utils';
import * as multer from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';

@Module({
    imports: [
        ActivityModule,
        MulterModule.register({
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, TREE_UPLOADS_DIR);
                },
                filename: (req, file, cb) => {
                    const ext = path.extname(file.originalname || '');
                    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
                },
            }),
            limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
        }),
    ],
    controllers: [TreesController, PersonsController],
    providers: [TreesService],
    exports: [TreesService],
})
export class TreesModule { }
