import { SearchService } from './search.service';
import { Request as ExpressRequest } from "express";
declare const OptionalJwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class OptionalJwtAuthGuard extends OptionalJwtAuthGuard_base {
    handleRequest(err: any, user: any, info: any): any;
}
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(q: string, req: ExpressRequest): Promise<{
        books: import("../../models/Book").Book[];
        trees: any[];
        people: {
            id: any;
            name: any;
            tree_id: any;
            tree_title: any;
            tree_description: any;
            tree_is_public: boolean;
            owner_name: any;
        }[];
    }>;
    suggest(q: string, req: ExpressRequest): Promise<{
        trees: any[];
        people: {
            id: any;
            name: any;
            tree_id: any;
            tree_title: any;
            tree_description: any;
            tree_is_public: boolean;
            owner_name: any;
        }[];
    }>;
}
export {};
