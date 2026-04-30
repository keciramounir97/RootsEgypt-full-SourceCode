import { BaseModel } from './BaseModel';
export declare class Tree extends BaseModel {
    static tableName: string;
    id: number;
    user_id?: number;
    title: string;
    description?: string;
    gedcom_path?: string;
    data_format?: 'gedcom' | 'gedcomx' | 'gedcom7';
    archive_source?: string;
    document_code?: string;
    is_public: boolean;
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
    static relationMappings: () => {
        owner: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
        people: {
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
