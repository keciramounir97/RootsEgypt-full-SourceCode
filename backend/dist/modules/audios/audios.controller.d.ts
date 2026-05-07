import { AudiosService } from './audios.service';
export declare class AudiosController {
    private readonly audiosService;
    private readonly logger;
    constructor(audiosService: AudiosService);
    listPublic(): Promise<import("../../models/Audio").Audio[]>;
    getPublic(id: number): Promise<import("../../models/Audio").Audio>;
    listMy(req: any): Promise<import("../../models/Audio").Audio[]>;
    createMy(body: any, req: any, file?: Express.Multer.File): Promise<import("../../models/Audio").Audio>;
    updateMy(id: number, body: any, req: any, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteMy(id: number, req: any): Promise<{
        message: string;
    }>;
    listAdmin(): Promise<import("../../models/Audio").Audio[]>;
    createAdmin(body: any, req: any, file?: Express.Multer.File): Promise<import("../../models/Audio").Audio>;
    updateAdmin(id: number, body: any, req: any, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    deleteAdmin(id: number, req: any): Promise<{
        message: string;
    }>;
}
