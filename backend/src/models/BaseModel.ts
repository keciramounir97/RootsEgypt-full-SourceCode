import { Model } from 'objection';

export class BaseModel extends Model {
    created_at: string;
    updated_at: string;

    $beforeInsert() {
        this.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        this.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    $beforeUpdate() {
        this.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
}
