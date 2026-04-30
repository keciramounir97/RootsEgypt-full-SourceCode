"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountDeletionRequest = void 0;
const objection_1 = require("objection");
class AccountDeletionRequest extends objection_1.Model {
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
exports.AccountDeletionRequest = AccountDeletionRequest;
AccountDeletionRequest.tableName = 'account_deletion_requests';
AccountDeletionRequest.jsonSchema = {
    type: 'object',
    required: ['user_id', 'email'],
    properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        email: { type: 'string' },
        reason: { type: ['string', 'null'] },
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
        requested_at: { type: 'string' },
        processed_at: { type: ['string', 'null'] },
        processed_by: { type: ['integer', 'null'] },
    },
};
AccountDeletionRequest.relationMappings = () => ({
    user: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'account_deletion_requests.user_id',
            to: 'users.id',
        },
    },
    processor: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'account_deletion_requests.processed_by',
            to: 'users.id',
        },
    },
});
//# sourceMappingURL=AccountDeletionRequest.js.map