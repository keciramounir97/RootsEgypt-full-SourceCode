import { Model } from 'objection';

export class Person extends Model {
    static tableName = 'persons';

    id!: number;
    tree_id?: number;
    name?: string;
    tree?: import('./Tree').Tree;

    static jsonSchema = {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            tree_id: { type: 'integer' },
            name: { type: 'string' },
        },
    };

    static relationMappings = () => ({
        tree: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./Tree').Tree,
            join: {
                from: 'persons.tree_id',
                to: 'family_trees.id',
            },
        },
    });
}
