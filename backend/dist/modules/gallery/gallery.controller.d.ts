import { GalleryService } from './gallery.service';
import { Request as ExpressRequest } from "express";
import { CreateGalleryDto, UpdateGalleryDto } from './dto/gallery.dto';
export declare class GalleryController {
    private readonly galleryService;
    private readonly logger;
    constructor(galleryService: GalleryService);
    listPublic(): Promise<import("../../models/Gallery").Gallery[]>;
    getPublic(id: number): Promise<import("../../models/Gallery").Gallery>;
    listMy(req: ExpressRequest): Promise<import("../../models/Gallery").Gallery[]>;
    getMy(id: number, req: ExpressRequest): Promise<import("../../models/Gallery").Gallery>;
    createMy(body: CreateGalleryDto, req: ExpressRequest, file: Express.Multer.File): Promise<import("../../models/Gallery").Gallery>;
    saveMy(id: number, body: UpdateGalleryDto, req: ExpressRequest, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    updateMy(id: number, body: UpdateGalleryDto, req: ExpressRequest, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteMy(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
    listAdmin(): Promise<import("../../models/Gallery").Gallery[]>;
    getAdmin(id: number): Promise<import("../../models/Gallery").Gallery>;
    createAdmin(body: CreateGalleryDto, req: ExpressRequest, file: Express.Multer.File): Promise<import("../../models/Gallery").Gallery>;
    saveAdmin(id: number, body: UpdateGalleryDto, req: ExpressRequest, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    updateAdmin(id: number, body: UpdateGalleryDto, req: ExpressRequest, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteAdmin(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
}
