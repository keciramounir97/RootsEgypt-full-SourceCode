"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const BaseModel_1 = require("./BaseModel");
const objection_1 = require("objection");
class RefreshToken extends BaseModel_1.BaseModel {
    $beforeInsert() {
        this.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    $beforeUpdate() {
    }
}
exports.RefreshToken = RefreshToken;
RefreshToken.tableName = 'refresh_tokens';
RefreshToken.jsonSchema = {
    type: 'object',
    required: ['token', 'user_id', 'expires_at'],
    properties: {
        id: { type: 'integer' },
        token: { type: 'string' },
        user_id: { type: 'integer' },
    },
};
RefreshToken.relationMappings = () => ({
    user: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'refresh_tokens.user_id',
            to: 'users.id',
        },
    },
});
//# sourceMappingURL=RefreshToken.js.map