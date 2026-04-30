import { Model } from 'objection';

export class Role extends Model {
    static tableName = 'roles';

    id!: number;
    name!: string;
    permissions?: string;

    static jsonSchema = {
        type: 'object',
        required: ['name'],
        properties: {
            id: { type: 'integer' },
            name: { type: 'string', minLength: 1, maxLength: 255 },
            permissions: { type: ['string', 'null'] },
        },
    };
}
