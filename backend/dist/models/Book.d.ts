import { BaseModel } from './BaseModel';
export declare class Book extends BaseModel {
    static tableName: string;
    id: number;
    title: string;
    author?: string;
    description?: string;
    category?: string;
    file_path: string;
    cover_path?: string;
    file_size?: number;
    archive_source?: string;
    document_code?: string;
    uploaded_by?: number;
    is_public: boolean;
    download_count: number;
    uploader?: import('./User').User;
    images?: import('./Gallery').Gallery[];
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
            file_path: {
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
        images: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
    };
}
