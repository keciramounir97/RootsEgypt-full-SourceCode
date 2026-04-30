"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLog = void 0;
const objection_1 = require("objection");
class ActivityLog extends objection_1.Model {
    $beforeInsert() {
        this.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
}
exports.ActivityLog = ActivityLog;
ActivityLog.tableName = 'activity_logs';
ActivityLog.jsonSchema = {
    type: 'object',
    required: ['type', 'description'],
    properties: {
        id: { type: 'integer' },
        actor_user_id: { type: ['integer', 'null'] },
        type: { type: 'string' },
        description: { type: 'string' },
    },
};
ActivityLog.relationMappings = () => ({
    actor: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: require('./User').User,
        join: {
            from: 'activity_logs.actor_user_id',
            to: 'users.id',
        },
    },
});
//# sourceMappingURL=ActivityLog.js.map