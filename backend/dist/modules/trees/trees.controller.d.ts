import { TreesService } from './trees.service';
import { Response } from 'express';
import { CreateTreeDto, UpdateTreeDto } from './dto/tree.dto';
export declare class TreesController {
    private readonly treesService;
    private readonly logger;
    constructor(treesService: TreesService);
    listPublic(): Promise<import("../../models/Tree").Tree[]>;
    downloadPublicGedcom(id: number, res: Response): Promise<void>;
    getPublic(id: number): Promise<import("../../models/Tree").Tree>;
    listMy(req: any): Promise<import("../../models/Tree").Tree[]>;
    getMy(id: number, req: any): Promise<import("../../models/Tree").Tree>;
    createMy(body: CreateTreeDto, req: any, file?: Express.Multer.File): Promise<import("../../models/Tree").Tree>;
    updateMy(id: number, body: UpdateTreeDto, req: any, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    saveMy(id: number, body: UpdateTreeDto, req: any, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteMy(id: number, req: any): Promise<{
        message: string;
    }>;
    downloadMyGedcom(id: number, res: Response, req: any): Promise<void>;
    listAdmin(): Promise<import("../../models/Tree").Tree[]>;
    getAdmin(id: number): Promise<import("../../models/Tree").Tree>;
    downloadAdminGedcom(id: number, res: Response): Promise<void>;
    createAdmin(body: CreateTreeDto, req: any, file?: Express.Multer.File): Promise<import("../../models/Tree").Tree>;
    saveAdmin(id: number, body: UpdateTreeDto, req: any, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    updateAdmin(id: number, body: UpdateTreeDto, req: any, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteAdmin(id: number, req: any): Promise<{
        message: string;
    }>;
}
