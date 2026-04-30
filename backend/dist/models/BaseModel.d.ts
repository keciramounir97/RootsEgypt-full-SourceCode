import { Model } from 'objection';
export declare class BaseModel extends Model {
    created_at: string;
    updated_at: string;
    $beforeInsert(): void;
    $beforeUpdate(): void;
}
