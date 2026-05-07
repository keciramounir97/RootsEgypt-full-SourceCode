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
exports.SuggestionsService = void 0;
const common_1 = require("@nestjs/common");
const Suggestion_1 = require("../../models/Suggestion");
const activity_service_1 = require("../activity/activity.service");
let SuggestionsService = class SuggestionsService {
    constructor(knex, activityService) {
        this.knex = knex;
        this.activityService = activityService;
    }
    now() {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    clean(value) {
        const text = String(value !== null && value !== void 0 ? value : '').trim();
        return text.length ? text : null;
    }
    mapRow(row) {
        const fullName = row.fullName || row.full_name || row.user_name || row.userName;
        const email = row.email || row.user_email || row.userEmail;
        return {
            id: row.id,
            type: row.type,
            category: row.category || '',
            contentTitle: row.content_title || row.contentTitle || '',
            userId: row.user_id ? String(row.user_id) : 'visitor',
            userName: fullName || 'Visitor',
            userEmail: email || 'Not provided',
            userPhone: row.user_phone || row.userPhone || '',
            message: row.message || '',
            status: row.status || 'pending',
            createdAt: row.created_at || row.createdAt,
            processedAt: row.processed_at || row.processedAt || null,
            processedBy: row.processed_by || row.processedBy || null,
        };
    }
    async querySuggestions(status) {
        const query = this.knex('suggestions')
            .leftJoin('users', 'suggestions.user_id', 'users.id')
            .select('suggestions.*', 'users.full_name as fullName', 'users.email as email');
        if (status) {
            query.where('suggestions.status', status);
        }
        const rows = await query
            .orderByRaw("case when suggestions.status = 'pending' then 0 when suggestions.status = 'approved' then 1 else 2 end")
            .orderBy('suggestions.created_at', 'desc');
        return rows.map((row) => this.mapRow(row));
    }
    async create(data) {
        const type = this.clean(data.type) || 'content';
        const category = this.clean(data.category);
        const contentTitle = this.clean(data.contentTitle || data.content_title);
        const message = this.clean(data.message);
        if (!category && !contentTitle && !message) {
            throw new common_1.BadRequestException('Suggestion details are required');
        }
        const item = await Suggestion_1.Suggestion.query(this.knex).insertAndFetch({
            type,
            category,
            content_title: contentTitle,
            user_name: this.clean(data.userName || data.user_name),
            user_email: this.clean(data.userEmail || data.user_email),
            user_phone: this.clean(data.userPhone || data.user_phone),
            message: message || 'No message provided.',
            status: 'pending',
        });
        await this.activityService.log(null, 'suggestions', `Created suggestion: ${category || contentTitle || type}`);
        return this.mapRow(item);
    }
    async listAdmin() {
        return this.querySuggestions();
    }
    async listPublic() {
        return this.querySuggestions('approved');
    }
    async updateStatus(id, status, adminId) {
        const item = await Suggestion_1.Suggestion.query(this.knex).findById(id);
        if (!item)
            throw new common_1.NotFoundException('Suggestion not found');
        await Suggestion_1.Suggestion.query(this.knex)
            .patch({
            status,
            processed_by: adminId,
            processed_at: this.now(),
            updated_at: this.now(),
        })
            .where('id', id);
        await this.activityService.log(adminId, 'suggestions', `${status === 'approved' ? 'Approved' : 'Rejected'} suggestion #${id}`);
        const updated = await this.knex('suggestions')
            .leftJoin('users', 'suggestions.user_id', 'users.id')
            .select('suggestions.*', 'users.full_name as fullName', 'users.email as email')
            .where('suggestions.id', id)
            .first();
        return this.mapRow(updated);
    }
};
exports.SuggestionsService = SuggestionsService;
exports.SuggestionsService = SuggestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [Object, activity_service_1.ActivityService])
], SuggestionsService);
//# sourceMappingURL=suggestions.service.js.map