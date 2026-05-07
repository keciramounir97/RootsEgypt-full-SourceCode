import { BaseModel } from './BaseModel';
export declare class Article extends BaseModel {
    static tableName: string;
    id: number;
    title?: string;
    category?: string;
    content: string;
    author_id?: number;
    author_name?: string;
    images?: string;
    videos?: string;
    comments?: string;
    visibility?: string;
    likes: number;
    is_public: boolean;
    seed_key?: string;
    static jsonSchema: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
            };
            title: {
                type: string;
                minLength: number;
                maxLength: number;
            };
            category: {
                type: string[];
                maxLength: number;
            };
            content: {
                type: string;
            };
            images: {
                type: string[];
            };
            videos: {
                type: string[];
            };
            comments: {
                type: string[];
            };
            visibility: {
                type: string;
            };
            is_public: {
                type: string;
            };
            seed_key: {
                type: string[];
            };
        };
    };
}
