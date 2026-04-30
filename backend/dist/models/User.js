"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const BaseModel_1 = require("./BaseModel");
const objection_1 = require("objection");
class User extends BaseModel_1.BaseModel {
}
exports.User = User;
User.tableName = 'users';
User.jsonSchema = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        id: { type: 'integer' },
        email: { type: 'string', minLength: 1, maxLength: 255 },
        password: { type: 'string', minLength: 1, maxLength: 255 },
        full_name: { type: ['string', 'null'] },
        phone_number: { type: ['string', 'null'] },
        role_id: { type: 'integer' },
        status: { type: 'string' },
        admin_privileges: { type: ['string', 'null'] },
    },
};
User.relationMappings = () => ({
    role: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./Role').Role,
        join: {
            from: 'users.role_id',
            to: 'roles.id',
        },
    },
    books: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: require('./Book').Book,
        join: {
            from: 'users.id',
            to: 'books.uploaded_by',
        },
    },
    trees: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: require('./Tree').Tree,
        join: {
            from: 'users.id',
            to: 'family_trees.user_id',
        },
    },
    logs: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: require('./ActivityLog').ActivityLog,
        join: {
            from: 'users.id',
            to: 'activity_logs.actor_user_id',
        },
    },
});
//# sourceMappingURL=User.js.map