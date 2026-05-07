import { BaseModel } from './BaseModel';
export declare class Audio extends BaseModel {
    static tableName: string;
    id: number;
    title: string;
    description?: string;
    audio_path?: string;
    duration?: number;
    category?: string;
    archive_source?: string;
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
