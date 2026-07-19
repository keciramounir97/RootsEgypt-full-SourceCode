import { OnModuleInit } from '@nestjs/common';
import { Knex } from "knex";
import { Book } from '../../models/Book';
import { ActivityService } from '../activity/activity.service';
export declare class BooksService implements OnModuleInit {
    private readonly knex;
    private readonly activityService;
    constructor(knex: Knex, activityService: ActivityService);
    onModuleInit(): Promise<void>;
    private ensureBookSchema;
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
    getStoredFile(book: Book): {
        data: Buffer<ArrayBufferLike>;
        mimeType: string;
        filename: string;
    };
}
