"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const knex_1 = require("knex");
function toTimestamp(value) {
    const time = value ? new Date(value).getTime() : Date.now();
    return Number.isFinite(time) ? time : Date.now();
}
let NotificationsService = class NotificationsService {
    constructor(knex) {
        this.knex = knex;
    }
    async list(limit = 50) {
        const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
        try {
            const rows = await this.knex("activity_logs")
                .select("id", "type", "description", "created_at")
                .orderBy("created_at", "desc")
                .limit(safeLimit);
            return rows.map((row) => ({
                id: `activity-${row.id}`,
                title: row.type ? String(row.type) : "Activity",
                body: row.description ? String(row.description) : undefined,
                createdAt: toTimestamp(row.created_at),
                read: false,
                type: row.type ? String(row.type) : undefined,
            }));
        }
        catch (_a) {
            return [];
        }
    }
    async markRead(id) {
        return { message: "Notification marked as read.", id };
    }
    async markAllRead() {
        return { message: "All notifications marked as read." };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("KnexConnection")),
    __metadata("design:paramtypes", [Function])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map