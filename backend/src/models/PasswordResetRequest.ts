import { Model } from 'objection';

export class PasswordResetRequest extends Model {
    static tableName = 'password_reset_requests';

    id!: number;
    user_id!: number;
    email!: string;
    status!: 'pending' | 'approved' | 'rejected' | 'completed';
    requested_at!: string;
    processed_at?: string;
    processed_by?: number;
    reset_token?: string;
    token_expires_at?: string;

    user?: import('./User').User;
    processor?: import('./User').User;

    $beforeInsert() {
        this.requested_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        if (!this.status) this.status = 'pending';
    }

    $beforeUpdate() {
        if (this.status !== 'pending' && !this.processed_at) {
            this.processed_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        }
    }

    static jsonSchema = {
        type: 'object',
        required: ['user_id', 'email'],
        properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            email: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'completed'] },
            requested_at: { type: 'string' },
            processed_at: { type: ['string', 'null'] },
            processed_by: { type: ['integer', 'null'] },
            reset_token: { type: ['string', 'null'] },
            token_expires_at: { type: ['string', 'null'] },
        },
    };

    static relationMappings = () => ({
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'password_reset_requests.user_id',
                to: 'users.id',
            },
        },
        processor: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'password_reset_requests.processed_by',
                to: 'users.id',
            },
        },
    });
}
