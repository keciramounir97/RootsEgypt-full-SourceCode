import { BaseModel } from './BaseModel';
import { Model } from 'objection';

export class Suggestion extends BaseModel {
    static tableName = 'suggestions';

    id!: number;
    type!: string;
    category?: string;
    content_title?: string;
    user_id?: number;
    user_name?: string;
    user_email?: string;
    user_phone?: string;
    message?: string;
    status!: string;
    processed_by?: number;
    processed_at?: string;

    user?: import('./User').User;
    processor?: import('./User').User;

    static jsonSchema = {
        type: 'object',
        required: ['type', 'status'],
        properties: {
            id: { type: 'integer' },
            type: { type: 'string', minLength: 1, maxLength: 80 },
            category: { type: ['string', 'null'], maxLength: 255 },
            content_title: { type: ['string', 'null'], maxLength: 255 },
            user_id: { type: ['integer', 'null'] },
            user_name: { type: ['string', 'null'], maxLength: 255 },
            user_email: { type: ['string', 'null'], maxLength: 255 },
            user_phone: { type: ['string', 'null'], maxLength: 80 },
            message: { type: ['string', 'null'] },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            processed_by: { type: ['integer', 'null'] },
            processed_at: { type: ['string', 'null'] },
        },
    };

    static relationMappings = () => ({
        user: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'suggestions.user_id',
                to: 'users.id',
            },
        },
        processor: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'suggestions.processed_by',
                to: 'users.id',
            },
        },
    });
}
