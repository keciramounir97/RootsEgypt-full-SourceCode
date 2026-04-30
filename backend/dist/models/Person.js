"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Person = void 0;
const objection_1 = require("objection");
class Person extends objection_1.Model {
}
exports.Person = Person;
Person.tableName = 'persons';
Person.jsonSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        tree_id: { type: 'integer' },
        name: { type: 'string' },
    },
};
Person.relationMappings = () => ({
    tree: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./Tree').Tree,
        join: {
            from: 'persons.tree_id',
            to: 'family_trees.id',
        },
    },
});
//# sourceMappingURL=Person.js.map