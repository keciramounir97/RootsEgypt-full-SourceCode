import { BooksService } from './books.service';
import { Response } from 'express';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
export declare class BooksController {
    private readonly booksService;
    private readonly logger;
    constructor(booksService: BooksService);
    listPublic(): Promise<import("../../models/Book").Book[]>;
    getPublic(id: number): Promise<import("../../models/Book").Book>;
    downloadPublic(id: number, res: Response): Promise<void>;
    listMy(req: any): Promise<import("../../models/Book").Book[]>;
    getMy(id: number, req: any): Promise<import("../../models/Book").Book>;
    createMy(body: CreateBookDto, req: any, files: {
        file?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<import("../../models/Book").Book>;
    updateMy(id: number, body: UpdateBookDto, req: any, files: {
        file?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<{
        id: number;
    }>;
    deleteMy(id: number, req: any): Promise<{
        message: string;
    }>;
    downloadMy(id: number, res: Response, req: any): Promise<void>;
    listAdmin(): Promise<import("../../models/Book").Book[]>;
    getAdmin(id: number): Promise<import("../../models/Book").Book>;
    createAdmin(body: CreateBookDto, req: any, files: {
        file?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<import("../../models/Book").Book>;
    updateAdmin(id: number, body: UpdateBookDto, req: any, files: {
        file?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<{
        id: number;
    }>;
    deleteAdmin(id: number, req: any): Promise<{
        message: string;
    }>;
}
