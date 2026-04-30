import { Model } from 'objection';
export declare class Role extends Model {
    static tableName: string;
    id: number;
    name: string;
    permissions?: string;
    static jsonSchema: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
            };
            name: {
                type: string;
                minLength: number;
                maxLength: number;
            };
            permissions: {
                type: string[];
            };
        };
    };
}
