import { BaseModel } from './BaseModel';
import { Model } from 'objection';

export class Book extends BaseModel {
    static tableName = 'books';

    id!: number;
    title!: string;
    author?: string;
    description?: string;
    category?: string;
    file_path!: string;
    cover_path?: string;
    file_size?: number; // BigInt handled as number/string in JS
    archive_source?: string;
    document_code?: string;
    uploaded_by?: number;
    is_public!: boolean;
    download_count!: number;

    uploader?: import('./User').User;
    images?: import('./Gallery').Gallery[];

    static jsonSchema = {
        type: 'object',
        required: ['title', 'file_path'],
        properties: {
            id: { type: 'integer' },
            title: { type: 'string', minLength: 1, maxLength: 255 },
            file_path: { type: 'string' },
            is_public: { type: 'boolean' },
        },
    };

    static relationMappings = () => ({
        uploader: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'books.uploaded_by',
                to: 'users.id',
            },
        },
        images: {
            relation: Model.HasManyRelation,
            modelClass: require('./Gallery').Gallery,
            join: {
                from: 'books.id',
                to: 'gallery.book_id',
            },
        },
    });
}
