import { Model } from 'objection';
export declare class AccountDeletionRequest extends Model {
    static tableName: string;
    id: number;
    user_id: number;
    email: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    requested_at: string;
    processed_at?: string;
    processed_by?: number;
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
            reason: {
                type: string[];
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
