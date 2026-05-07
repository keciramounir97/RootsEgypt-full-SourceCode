import { ArticlesService } from './articles.service';
export declare class ArticlesController {
    private readonly articlesService;
    private readonly logger;
    constructor(articlesService: ArticlesService);
    listPublic(): Promise<any>;
    getPublic(id: number): Promise<any>;
    listMy(req: any): Promise<any>;
    createMy(body: any, req: any): Promise<any>;
    updateMy(id: number, body: any, req: any): Promise<any>;
    deleteMy(id: number, req: any): Promise<{
        message: string;
    }>;
    like(id: number, req: any): Promise<{
        id: number;
        likes: any;
    }>;
    listAdmin(): Promise<any>;
    createAdmin(body: any, req: any): Promise<any>;
    updateAdmin(id: number, body: any, req: any): Promise<any>;
    deleteAdmin(id: number, req: any): Promise<{
        message: string;
    }>;
}
