import { OnModuleInit } from '@nestjs/common';
import { Document } from '../../models/Document';
import { ActivityService } from '../activity/activity.service';
export declare const DOCUMENT_UPLOADS_DIR: string;
export declare class DocumentsService implements OnModuleInit {
    private readonly knex;
    private readonly activityService;
    constructor(knex: any, activityService: ActivityService);
    onModuleInit(): Promise<void>;
    listPublic(): Promise<Document[]>;
    getPublic(id: number): Promise<Document>;
    listByUser(userId: number): Promise<Document[]>;
    listAdmin(): Promise<Document[]>;
    findOne(id: number): Promise<Document>;
    create(data: any, userId: number, file?: Express.Multer.File): Promise<Document>;
    update(id: number, data: any, userId: number, userRole: number, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    delete(id: number, userId: number, userRole: number): Promise<{
        message: string;
    }>;
}
