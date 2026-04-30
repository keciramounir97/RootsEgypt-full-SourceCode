"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetRequest = void 0;
const objection_1 = require("objection");
class PasswordResetRequest extends objection_1.Model {
    $beforeInsert() {
        this.requested_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        if (!this.status)
            this.status = 'pending';
    }
    $beforeUpdate() {
        if (this.status !== 'pending' && !this.processed_at) {
            this.processed_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        }
    }
}
exports.PasswordResetRequest = PasswordResetRequest;
PasswordResetRequest.tableName = 'password_reset_requests';
PasswordResetRequest.jsonSchema = {
    type: 'object',
    required: ['user_id', 'email'],
    properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        email: { type: 'string' },
        status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'completed'] },
        requested_at: { type: 'string' },
        processed_at: { type: ['string', 'null'] },
        processed_by: { type: ['integer', 'null'] },
        reset_token: { type: ['string', 'null'] },
        token_expires_at: { type: ['string', 'null'] },
    },
};
PasswordResetRequest.relationMappings = () => ({
    user: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'password_reset_requests.user_id',
            to: 'users.id',
        },
    },
    processor: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'password_reset_requests.processed_by',
            to: 'users.id',
        },
    },
});
//# sourceMappingURL=PasswordResetRequest.js.map