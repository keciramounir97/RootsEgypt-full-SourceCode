"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = void 0;
const BaseModel_1 = require("./BaseModel");
const objection_1 = require("objection");
class Tree extends BaseModel_1.BaseModel {
}
exports.Tree = Tree;
Tree.tableName = 'family_trees';
Tree.jsonSchema = {
    type: 'object',
    required: ['title'],
    properties: {
        id: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        is_public: { type: 'boolean' },
    },
};
Tree.relationMappings = () => ({
    owner: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'family_trees.user_id',
            to: 'users.id',
        },
    },
    people: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: require('./Person').Person,
        join: {
            from: 'family_trees.id',
            to: 'persons.tree_id',
        },
    },
    images: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: require('./Gallery').Gallery,
        join: {
            from: 'family_trees.id',
            to: 'gallery.tree_id',
        },
    },
});
//# sourceMappingURL=Tree.js.map