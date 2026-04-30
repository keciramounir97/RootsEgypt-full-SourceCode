import { Book } from '../../models/Book';
import { ActivityService } from '../activity/activity.service';
export declare class BooksService {
    private readonly knex;
    private readonly activityService;
    constructor(knex: any, activityService: ActivityService);
    listPublic(): Promise<Book[]>;
    getPublic(id: number): Promise<Book>;
    listByUser(userId: number): Promise<Book[]>;
    listAdmin(): Promise<Book[]>;
    findOne(id: number): Promise<Book>;
    create(data: any, userId: number, files: {
        file?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<Book>;
    update(id: number, data: any, userId: number, userRole: number, files: {
        file?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<{
        id: number;
    }>;
    delete(id: number, userId: number, userRole: number): Promise<{
        message: string;
    }>;
    incrementDownload(id: number): Promise<void>;
    getFilePath(book: Book): string;
}
