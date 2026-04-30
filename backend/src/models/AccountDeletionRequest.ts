import { Model } from 'objection';

export class AccountDeletionRequest extends Model {
    static tableName = 'account_deletion_requests';

    id!: number;
    user_id!: number;
    email!: string;
    reason?: string;
    status!: 'pending' | 'approved' | 'rejected';
    requested_at!: string;
    processed_at?: string;
    processed_by?: number;

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
            reason: { type: ['string', 'null'] },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            requested_at: { type: 'string' },
            processed_at: { type: ['string', 'null'] },
            processed_by: { type: ['integer', 'null'] },
        },
    };

    static relationMappings = () => ({
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'account_deletion_requests.user_id',
                to: 'users.id',
            },
        },
        processor: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'account_deletion_requests.processed_by',
                to: 'users.id',
            },
        },
    });
}
