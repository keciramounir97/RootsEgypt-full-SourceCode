import { Model } from 'objection';
export declare class ActivityLog extends Model {
    static tableName: string;
    id: number;
    actor_user_id?: number;
    type: string;
    description: string;
    created_at?: string;
    actor?: import('./User').User;
    $beforeInsert(): void;
    static jsonSchema: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
            };
            actor_user_id: {
                type: string[];
            };
            type: {
                type: string;
            };
            description: {
                type: string;
            };
        };
    };
    static relationMappings: () => {
        actor: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
    };
}
