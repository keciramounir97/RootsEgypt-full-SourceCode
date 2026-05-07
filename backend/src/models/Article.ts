import { BaseModel } from './BaseModel';

export class Article extends BaseModel {
    static tableName = 'articles';

    id!: number;
    title?: string;
    category?: string;
    content!: string;
    author_id?: number;
    author_name?: string;
    images?: string;
    videos?: string;
    comments?: string;
    visibility?: string;
    likes!: number;
    is_public!: boolean;
    seed_key?: string;

    static jsonSchema = {
        type: 'object',
        required: ['content'],
        properties: {
            id: { type: 'integer' },
            title: { type: 'string', minLength: 1, maxLength: 255 },
            category: { type: ['string', 'null'], maxLength: 255 },
            content: { type: 'string' },
            images: { type: ['string', 'null'] },
            videos: { type: ['string', 'null'] },
            comments: { type: ['string', 'null'] },
            visibility: { type: 'string' },
            is_public: { type: 'boolean' },
            seed_key: { type: ['string', 'null'] },
        },
    };
}
