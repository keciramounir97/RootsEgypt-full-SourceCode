"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gallery = void 0;
const BaseModel_1 = require("./BaseModel");
const objection_1 = require("objection");
class Gallery extends BaseModel_1.BaseModel {
}
exports.Gallery = Gallery;
Gallery.tableName = 'gallery';
Gallery.jsonSchema = {
    type: 'object',
    required: ['title', 'image_path'],
    properties: {
        id: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        image_path: { type: 'string' },
        is_public: { type: 'boolean' },
    },
};
Gallery.relationMappings = () => ({
    uploader: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'gallery.uploaded_by',
            to: 'users.id',
        },
    },
    book: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./Book').Book,
        join: {
            from: 'gallery.book_id',
            to: 'books.id',
        },
    },
    tree: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./Tree').Tree,
        join: {
            from: 'gallery.tree_id',
            to: 'family_trees.id',
        },
    },
});
//# sourceMappingURL=Gallery.js.map