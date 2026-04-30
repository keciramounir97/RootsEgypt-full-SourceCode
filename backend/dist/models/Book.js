"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const BaseModel_1 = require("./BaseModel");
const objection_1 = require("objection");
class Book extends BaseModel_1.BaseModel {
}
exports.Book = Book;
Book.tableName = 'books';
Book.jsonSchema = {
    type: 'object',
    required: ['title', 'file_path'],
    properties: {
        id: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        file_path: { type: 'string' },
        is_public: { type: 'boolean' },
    },
};
Book.relationMappings = () => ({
    uploader: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'books.uploaded_by',
            to: 'users.id',
        },
    },
    images: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: require('./Gallery').Gallery,
        join: {
            from: 'books.id',
            to: 'gallery.book_id',
        },
    },
});
//# sourceMappingURL=Book.js.map