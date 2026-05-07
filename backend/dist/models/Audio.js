"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audio = void 0;
const BaseModel_1 = require("./BaseModel");
class Audio extends BaseModel_1.BaseModel {
}
exports.Audio = Audio;
Audio.tableName = 'audios';
Audio.jsonSchema = {
    type: 'object',
    required: ['title'],
    properties: {
        id: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        is_public: { type: 'boolean' },
    },
};
//# sourceMappingURL=Audio.js.map