import { OnModuleInit } from '@nestjs/common';
import { Knex } from "knex";
import { Gallery } from '../../models/Gallery';
import { ActivityService } from '../activity/activity.service';
export declare class GalleryService implements OnModuleInit {
    private readonly knex;
    private readonly activityService;
    constructor(knex: Knex, activityService: ActivityService);
    onModuleInit(): Promise<void>;
    private ensureGallerySchema;
    listPublic(): Promise<Gallery[]>;
    getPublic(id: number): Promise<Gallery>;
    listByUser(userId: number): Promise<Gallery[]>;
    listAdmin(): Promise<Gallery[]>;
    findOne(id: number): Promise<Gallery>;
    create(data: any, userId: number, file: Express.Multer.File): Promise<Gallery>;
    update(id: number, data: any, userId: number, userRole: number, file: Express.Multer.File): Promise<{
        id: number;
    }>;
    delete(id: number, userId: number, userRole: number): Promise<{
        message: string;
    }>;
}
