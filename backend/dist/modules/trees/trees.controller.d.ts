import { TreesService } from './trees.service';
import { Response, Request as ExpressRequest } from "express";
import { Knex } from "knex";
import { CreateTreeDto, UpdateTreeDto } from './dto/tree.dto';
export declare const buildFallbackGedcom: (tree: {
    id?: number;
    title?: string;
    description?: string;
}, people?: Array<{
    id?: number;
    name?: string;
}>) => string;
export declare class TreesController {
    private readonly treesService;
    private readonly knex;
    private readonly logger;
    constructor(treesService: TreesService, knex: Knex);
    private sendGedcomResponse;
    listPublic(): Promise<import("../../models/Tree").Tree[]>;
    downloadPublicGedcom(id: number, res: Response): Promise<void>;
    getPublic(id: number): Promise<import("../../models/Tree").Tree>;
    listMy(req: ExpressRequest): Promise<import("../../models/Tree").Tree[]>;
    getMy(id: number, req: ExpressRequest): Promise<import("../../models/Tree").Tree>;
    createMy(body: CreateTreeDto, req: ExpressRequest, file?: Express.Multer.File): Promise<import("../../models/Tree").Tree>;
    updateMy(id: number, body: UpdateTreeDto, req: ExpressRequest, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    saveMy(id: number, body: UpdateTreeDto, req: ExpressRequest, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteMy(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
    downloadMyGedcom(id: number, res: Response, req: ExpressRequest): Promise<void>;
    listAdmin(): Promise<import("../../models/Tree").Tree[]>;
    getAdmin(id: number): Promise<import("../../models/Tree").Tree>;
    downloadAdminGedcom(id: number, res: Response): Promise<void>;
    createAdmin(body: CreateTreeDto, req: ExpressRequest, file?: Express.Multer.File): Promise<import("../../models/Tree").Tree>;
    saveAdmin(id: number, body: UpdateTreeDto, req: ExpressRequest, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    updateAdmin(id: number, body: UpdateTreeDto, req: ExpressRequest, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteAdmin(id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
}
