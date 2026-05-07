import { BaseModel } from './BaseModel';

export class Document extends BaseModel {
    static tableName = 'documents';

    id!: number;
    title!: string;
    description?: string;
    file_path?: string;
    file_type?: string;
    category?: string;
    archive_source?: string;
    document_code?: string;
    date?: string;
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
