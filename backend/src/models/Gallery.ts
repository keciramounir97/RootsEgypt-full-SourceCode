import { BaseModel } from './BaseModel';
import { Model } from 'objection';

export class Gallery extends BaseModel {
    static tableName = 'gallery';

    id!: number;
    title!: string;
    description?: string;
    image_path!: string;
    uploaded_by?: number;
    book_id?: number;
    tree_id?: number;
    is_public!: boolean;
    archive_source?: string;
    document_code?: string;
    location?: string;
    year?: string;
    photographer?: string;

    uploader?: import('./User').User;
    book?: import('./Book').Book;
    tree?: import('./Tree').Tree;

    static jsonSchema = {
        type: 'object',
        required: ['title', 'image_path'],
        properties: {
            id: { type: 'integer' },
            title: { type: 'string', minLength: 1, maxLength: 255 },
            image_path: { type: 'string' },
            is_public: { type: 'boolean' },
        },
    };

    static relationMappings = () => ({
        uploader: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./User').User,
            join: {
                from: 'gallery.uploaded_by',
                to: 'users.id',
            },
        },
        book: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./Book').Book,
            join: {
                from: 'gallery.book_id',
                to: 'books.id',
            },
        },
        tree: {
            relation: Model.BelongsToOneRelation,
            modelClass: require('./Tree').Tree,
            join: {
                from: 'gallery.tree_id',
                to: 'family_trees.id',
            },
        },
    });
}
