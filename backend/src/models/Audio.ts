import { BaseModel } from './BaseModel';

export class Audio extends BaseModel {
    static tableName = 'audios';

    id!: number;
    title!: string;
    description?: string;
    audio_path?: string;
    duration?: number;
    category?: string;
    archive_source?: string;
    uploaded_by?: number;
    is_public!: boolean;
    likes!: number;

    static jsonSchema = {
        type: 'object',
        required: ['title'],
        properties: {
            id: { type: 'integer' },
            title: { type: 'string', minLength: 1, maxLength: 255 },
            is_public: { type: 'boolean' },
        },
    };
}
