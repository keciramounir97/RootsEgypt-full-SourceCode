import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    private readonly logger;
    constructor(documentsService: DocumentsService);
    listPublic(): Promise<import("../../models/Document").Document[]>;
    getPublic(id: number): Promise<import("../../models/Document").Document>;
    listMy(req: any): Promise<import("../../models/Document").Document[]>;
    createMy(body: any, req: any, file?: Express.Multer.File): Promise<import("../../models/Document").Document>;
    updateMy(id: number, body: any, req: any, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteMy(id: number, req: any): Promise<{
        message: string;
    }>;
    listAdmin(): Promise<import("../../models/Document").Document[]>;
    createAdmin(body: any, req: any, file?: Express.Multer.File): Promise<import("../../models/Document").Document>;
    updateAdmin(id: number, body: any, req: any, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteAdmin(id: number, req: any): Promise<{
        message: string;
    }>;
}
