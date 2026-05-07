import { BaseModel } from './BaseModel';
export declare class Suggestion extends BaseModel {
    static tableName: string;
    id: number;
    type: string;
    category?: string;
    content_title?: string;
    user_id?: number;
    user_name?: string;
    user_email?: string;
    user_phone?: string;
    message?: string;
    status: string;
    processed_by?: number;
    processed_at?: string;
    user?: import('./User').User;
    processor?: import('./User').User;
    static jsonSchema: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
            };
            type: {
                type: string;
                minLength: number;
                maxLength: number;
            };
            category: {
                type: string[];
                maxLength: number;
            };
            content_title: {
                type: string[];
                maxLength: number;
            };
            user_id: {
                type: string[];
            };
            user_name: {
                type: string[];
                maxLength: number;
            };
            user_email: {
                type: string[];
                maxLength: number;
            };
            user_phone: {
                type: string[];
                maxLength: number;
            };
            message: {
                type: string[];
            };
            status: {
                type: string;
                enum: string[];
            };
            processed_by: {
                type: string[];
            };
            processed_at: {
                type: string[];
            };
        };
    };
    static relationMappings: () => {
        user: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
        processor: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
    };
}
