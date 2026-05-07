import { BaseModel } from './BaseModel';
export declare class Document extends BaseModel {
    static tableName: string;
    id: number;
    title: string;
    description?: string;
    file_path?: string;
    file_type?: string;
    category?: string;
    archive_source?: string;
    document_code?: string;
    date?: string;
    uploaded_by?: number;
    is_public: boolean;
    likes: number;
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
            is_public: {
                type: string;
            };
        };
    };
}
