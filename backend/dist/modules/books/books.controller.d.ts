import { BooksService } from './books.service';
import { Response, Request as ExpressRequest } from "express";
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
export declare class BooksController {
    private readonly booksService;
    private readonly logger;
    constructor(booksService: BooksService);
    listPublic(): Promise<import("../../models/Book").Book[]>;
    getPublic(id: number): Promise<import("../../models/Book").Book>;
    downloadPublic(id: number, res: Response): Promise<void>;
    listMy(req: ExpressRequest): Promise<import("../../models/Book").Book[]>;
    getMy(id: number, req: ExpressRequest): Promise<import("../../models/Book").Book>;
    createMy(body: CreateBookDto, req: ExpressRequest, files: {
        file?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<import("../../models/Book").Book>;
    updateMy(id: number, body: UpdateBookDto, req: ExpressRequest, files: {
        file?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<{
        id: number;
    }>;
    deleteMy(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
    downloadMy(id: number, res: Response, req: ExpressRequest): Promise<void>;
    listAdmin(): Promise<import("../../models/Book").Book[]>;
    getAdmin(id: number): Promise<import("../../models/Book").Book>;
    createAdmin(body: CreateBookDto, req: ExpressRequest, files: {
        file?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<import("../../models/Book").Book>;
    updateAdmin(id: number, body: UpdateBookDto, req: ExpressRequest, files: {
        file?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<{
        id: number;
    }>;
    deleteAdmin(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
}
