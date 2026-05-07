"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const BaseModel_1 = require("./BaseModel");
class Article extends BaseModel_1.BaseModel {
}
exports.Article = Article;
Article.tableName = 'articles';
Article.jsonSchema = {
    type: 'object',
    required: ['content'],
    properties: {
        id: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        category: { type: ['string', 'null'], maxLength: 255 },
        content: { type: 'string' },
        images: { type: ['string', 'null'] },
        videos: { type: ['string', 'null'] },
        comments: { type: ['string', 'null'] },
        visibility: { type: 'string' },
        is_public: { type: 'boolean' },
        seed_key: { type: ['string', 'null'] },
    },
};
//# sourceMappingURL=Article.js.map