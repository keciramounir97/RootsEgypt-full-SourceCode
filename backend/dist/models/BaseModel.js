"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const objection_1 = require("objection");
class BaseModel extends objection_1.Model {
    $beforeInsert() {
        this.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        this.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    $beforeUpdate() {
        this.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=BaseModel.js.map