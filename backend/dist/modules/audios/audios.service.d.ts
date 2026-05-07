import { OnModuleInit } from '@nestjs/common';
import { Audio } from '../../models/Audio';
import { ActivityService } from '../activity/activity.service';
export declare const AUDIO_UPLOADS_DIR: string;
export declare class AudiosService implements OnModuleInit {
    private readonly knex;
    private readonly activityService;
    constructor(knex: any, activityService: ActivityService);
    onModuleInit(): Promise<void>;
    listPublic(): Promise<Audio[]>;
    getPublic(id: number): Promise<Audio>;
    listByUser(userId: number): Promise<Audio[]>;
    listAdmin(): Promise<Audio[]>;
    findOne(id: number): Promise<Audio>;
    create(data: any, userId: number, file?: Express.Multer.File): Promise<Audio>;
    update(id: number, data: any, userId: number, userRole: number, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    delete(id: number, userId: number, userRole: number): Promise<{
        message: string;
    }>;
}
