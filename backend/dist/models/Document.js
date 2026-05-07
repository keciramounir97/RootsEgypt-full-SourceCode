"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const BaseModel_1 = require("./BaseModel");
class Document extends BaseModel_1.BaseModel {
}
exports.Document = Document;
Document.tableName = 'documents';
Document.jsonSchema = {
    type: 'object',
    required: ['title'],
    properties: {
        id: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        is_public: { type: 'boolean' },
    },
};
//# sourceMappingURL=Document.js.map