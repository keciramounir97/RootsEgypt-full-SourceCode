import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Suggestion } from '../../models/Suggestion';
import { ActivityService } from '../activity/activity.service';

type SuggestionStatus = 'pending' | 'approved' | 'rejected';

@Injectable()
export class SuggestionsService {
    constructor(
        @Inject('KnexConnection') private readonly knex,
        private readonly activityService: ActivityService,
    ) { }

    private now() {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    private clean(value: any) {
        const text = String(value ?? '').trim();
        return text.length ? text : null;
    }

    private mapRow(row: any) {
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

    private async querySuggestions(status?: SuggestionStatus) {
        const query = this.knex('suggestions')
            .leftJoin('users', 'suggestions.user_id', 'users.id')
            .select(
                'suggestions.*',
                'users.full_name as fullName',
                'users.email as email',
            );

        if (status) {
            query.where('suggestions.status', status);
        }

        const rows = await query
            .orderByRaw("case when suggestions.status = 'pending' then 0 when suggestions.status = 'approved' then 1 else 2 end")
            .orderBy('suggestions.created_at', 'desc');

        return rows.map((row: any) => this.mapRow(row));
    }

    async create(data: any) {
        const type = this.clean(data.type) || 'content';
        const category = this.clean(data.category);
        const contentTitle = this.clean(data.contentTitle || data.content_title);
        const message = this.clean(data.message);

        if (!category && !contentTitle && !message) {
            throw new BadRequestException('Suggestion details are required');
        }

        const item = await Suggestion.query(this.knex).insertAndFetch({
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

    async updateStatus(id: number, status: SuggestionStatus, adminId: number) {
        const item = await Suggestion.query(this.knex).findById(id);
        if (!item) throw new NotFoundException('Suggestion not found');

        await Suggestion.query(this.knex)
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
}
