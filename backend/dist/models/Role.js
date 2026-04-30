"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const objection_1 = require("objection");
class Role extends objection_1.Model {
}
exports.Role = Role;
Role.tableName = 'roles';
Role.jsonSchema = {
    type: 'object',
    required: ['name'],
    properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        permissions: { type: ['string', 'null'] },
    },
};
//# sourceMappingURL=Role.js.map