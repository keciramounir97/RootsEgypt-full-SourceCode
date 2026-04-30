import { BaseModel } from './BaseModel';
import { Model } from 'objection';

export class RefreshToken extends BaseModel {
    static tableName = 'refresh_tokens';

    id!: number;
    token!: string;
    user_id!: number;
    expires_at!: string;

    user?: import('./User').User;

    static jsonSchema = {
        type: 'object',
        required: ['token', 'user_id', 'expires_at'],
        properties: {
            id: { type: 'integer' },
            token: { type: 'string' },
            user_id: { type: 'integer' },
        },
    };

    static relationMappings = () => ({
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'refresh_tokens.user_id',
                to: 'users.id',
            },
        },
    });

    $beforeInsert() {
        this.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    $beforeUpdate() {
        // No updated_at for refresh tokens
    }
}
