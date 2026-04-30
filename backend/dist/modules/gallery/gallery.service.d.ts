import { Gallery } from '../../models/Gallery';
import { ActivityService } from '../activity/activity.service';
export declare class GalleryService {
    private readonly knex;
    private readonly activityService;
    constructor(knex: any, activityService: ActivityService);
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
