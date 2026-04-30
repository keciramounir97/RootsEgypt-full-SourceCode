import { Model } from 'objection';
export declare class PasswordResetRequest extends Model {
    static tableName: string;
    id: number;
    user_id: number;
    email: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    requested_at: string;
    processed_at?: string;
    processed_by?: number;
    reset_token?: string;
    token_expires_at?: string;
    user?: import('./User').User;
    processor?: import('./User').User;
    $beforeInsert(): void;
    $beforeUpdate(): void;
    static jsonSchema: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
            };
            user_id: {
                type: string;
            };
            email: {
                type: string;
            };
            status: {
                type: string;
                enum: string[];
            };
            requested_at: {
                type: string;
            };
            processed_at: {
                type: string[];
            };
            processed_by: {
                type: string[];
            };
            reset_token: {
                type: string[];
            };
            token_expires_at: {
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
