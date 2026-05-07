"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Suggestion = void 0;
const BaseModel_1 = require("./BaseModel");
const objection_1 = require("objection");
class Suggestion extends BaseModel_1.BaseModel {
}
exports.Suggestion = Suggestion;
Suggestion.tableName = 'suggestions';
Suggestion.jsonSchema = {
    type: 'object',
    required: ['type', 'status'],
    properties: {
        id: { type: 'integer' },
        type: { type: 'string', minLength: 1, maxLength: 80 },
        category: { type: ['string', 'null'], maxLength: 255 },
        content_title: { type: ['string', 'null'], maxLength: 255 },
        user_id: { type: ['integer', 'null'] },
        user_name: { type: ['string', 'null'], maxLength: 255 },
        user_email: { type: ['string', 'null'], maxLength: 255 },
        user_phone: { type: ['string', 'null'], maxLength: 80 },
        message: { type: ['string', 'null'] },
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
        processed_by: { type: ['integer', 'null'] },
        processed_at: { type: ['string', 'null'] },
    },
};
Suggestion.relationMappings = () => ({
    user: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'suggestions.user_id',
            to: 'users.id',
        },
    },
    processor: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'suggestions.processed_by',
            to: 'users.id',
        },
    },
});
//# sourceMappingURL=Suggestion.js.map