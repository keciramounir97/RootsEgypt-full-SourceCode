import { Model } from 'objection';

export class ActivityLog extends Model {
    static tableName = 'activity_logs';

    id!: number;
    actor_user_id?: number;
    type!: string;
    description!: string;
    created_at?: string;

    actor?: import('./User').User;

    $beforeInsert() {
        this.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        // activity_logs has no updated_at column
    }

    static jsonSchema = {
        type: 'object',
        required: ['type', 'description'],
        properties: {
            id: { type: 'integer' },
            actor_user_id: { type: ['integer', 'null'] },
            type: { type: 'string' },
            description: { type: 'string' },
        },
    };

    static relationMappings = () => ({
        actor: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'activity_logs.actor_user_id',
                to: 'users.id',
            },
        },
    });
}
