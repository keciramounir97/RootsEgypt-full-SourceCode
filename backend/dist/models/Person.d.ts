import { Model } from 'objection';
export declare class Person extends Model {
    static tableName: string;
    id: number;
    tree_id?: number;
    name?: string;
    tree?: import('./Tree').Tree;
    static jsonSchema: {
        type: string;
        properties: {
            id: {
                type: string;
            };
            tree_id: {
                type: string;
            };
            name: {
                type: string;
            };
        };
    };
    static relationMappings: () => {
        tree: {
            relation: import("objection").RelationType;
            modelClass: any;
            join: {
                from: string;
                to: string;
            };
        };
    };
}
