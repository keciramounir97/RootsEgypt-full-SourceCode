import { BaseModel } from './BaseModel';
export declare class RefreshToken extends BaseModel {
    static tableName: string;
    id: number;
    token: string;
    user_id: number;
    expires_at: string;
    user?: import('./User').User;
    static jsonSchema: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
            };
            token: {
                type: string;
            };
            user_id: {
                type: string;
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
    };
    $beforeInsert(): void;
    $beforeUpdate(): void;
}
