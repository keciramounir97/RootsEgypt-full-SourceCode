import { BaseModel } from './BaseModel';
import { Model } from 'objection';

export class User extends BaseModel {
    static tableName = 'users';

    id!: number;
    full_name?: string;
    phone_number?: string;
    email!: string;
    password!: string;
    role_id!: number;
    status!: string;
    session_token?: string;
    last_login?: string;
    admin_privileges?: string;

    // Relations & Extras
    role?: import('./Role').Role;
    books?: import('./Book').Book[];
    trees?: import('./Tree').Tree[];
    logs?: import('./ActivityLog').ActivityLog[];
    roleName?: string; // from joinRelated

    static jsonSchema = {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            id: { type: 'integer' },
            email: { type: 'string', minLength: 1, maxLength: 255 },
            password: { type: 'string', minLength: 1, maxLength: 255 },
            full_name: { type: ['string', 'null'] },
            phone_number: { type: ['string', 'null'] },
            role_id: { type: 'integer' },
            status: { type: 'string' },
            admin_privileges: { type: ['string', 'null'] },
        },
    };

    static relationMappings = () => ({
        role: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./Role').Role,
            join: {
                from: 'users.role_id',
                to: 'roles.id',
            },
        },
        books: {
            relation: Model.HasManyRelation,
            modelClass: require('./Book').Book,
            join: {
                from: 'users.id',
                to: 'books.uploaded_by',
            },
        },
        trees: {
            relation: Model.HasManyRelation,
            modelClass: require('./Tree').Tree,
            join: {
                from: 'users.id',
                to: 'family_trees.user_id',
            },
        },
        logs: {
            relation: Model.HasManyRelation,
            modelClass: require('./ActivityLog').ActivityLog,
            join: {
                from: 'users.id',
                to: 'activity_logs.actor_user_id',
            },
        },
    });
}
