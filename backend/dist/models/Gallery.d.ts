import { BaseModel } from './BaseModel';
export declare class Gallery extends BaseModel {
    static tableName: string;
    id: number;
    title: string;
    description?: string;
    image_path: string;
    uploaded_by?: number;
    book_id?: number;
    tree_id?: number;
    is_public: boolean;
    archive_source?: string;
    document_code?: string;
    location?: string;
    year?: string;
    photographer?: string;
    uploader?: import('./User').User;
    book?: import('./Book').Book;
    tree?: import('./Tree').Tree;
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
            image_path: {
                type: string;
            };
            is_public: {
                type: string;
            };
        };
    };
    static relationMappings: () => {
        uploader: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
        book: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
        tree: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
    };
}
