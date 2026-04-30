import { BaseModel } from './BaseModel';
export declare class User extends BaseModel {
    static tableName: string;
    id: number;
    full_name?: string;
    phone_number?: string;
    email: string;
    password: string;
    role_id: number;
    status: string;
    session_token?: string;
    last_login?: string;
    admin_privileges?: string;
    role?: import('./Role').Role;
    books?: import('./Book').Book[];
    trees?: import('./Tree').Tree[];
    logs?: import('./ActivityLog').ActivityLog[];
    roleName?: string;
    static jsonSchema: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
            };
            email: {
                type: string;
                minLength: number;
                maxLength: number;
            };
            password: {
                type: string;
                minLength: number;
                maxLength: number;
            };
            full_name: {
                type: string[];
            };
            phone_number: {
                type: string[];
            };
            role_id: {
                type: string;
            };
            status: {
                type: string;
            };
            admin_privileges: {
                type: string[];
            };
        };
    };
    static relationMappings: () => {
        role: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
        books: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
        trees: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
        logs: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
    };
}
