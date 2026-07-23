import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Inject,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { Knex } from 'knex';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from '../activity/activity.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { DownloadContentType } from './dto/download-request.dto';

type ContentConfig = {
    table: string;
    ownerColumn: string;
    titleColumn: string;
    createdAtColumn: string;
};

const CONTENT_CONFIG: Record<DownloadContentType, ContentConfig> = {
    tree: { table: 'family_trees', ownerColumn: 'user_id', titleColumn: 'title', createdAtColumn: 'created_at' },
    book: { table: 'books', ownerColumn: 'uploaded_by', titleColumn: 'title', createdAtColumn: 'created_at' },
    gallery: { table: 'gallery', ownerColumn: 'uploaded_by', titleColumn: 'title', createdAtColumn: 'created_at' },
    audio: { table: 'audios', ownerColumn: 'uploaded_by', titleColumn: 'title', createdAtColumn: 'created_at' },
    document: { table: 'documents', ownerColumn: 'uploaded_by', titleColumn: 'title', createdAtColumn: 'created_at' },
};

@Injectable()
export class DownloadRequestsService implements OnModuleInit {
    constructor(
        @Inject('KnexConnection') private readonly knex: Knex,
        private readonly activityService: ActivityService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit() {
        try {
            await this.ensureSchema();
        } catch (err: any) {
            console.warn(`Download requests schema init skipped: ${err?.message || err}`);
        }
    }

    private async ensureSchema() {
        if (!(await this.knex.schema.hasTable('download_requests'))) {
            await this.knex.schema.createTable('download_requests', (table) => {
                table.increments('id').primary();
                table.string('content_type', 20).notNullable();
                table.integer('content_id').unsigned().notNullable();
                table.string('content_title').nullable();
                table.dateTime('content_created_at').nullable();
                table.integer('owner_id').unsigned().nullable();
                table.integer('requester_id').unsigned().notNullable();
                table.string('status').notNullable().defaultTo('pending');
                table.dateTime('requested_at').notNullable().defaultTo(this.knex.fn.now());
                table.dateTime('processed_at').nullable();
                table.integer('processed_by').unsigned().nullable();

                table.index(['content_type', 'content_id']);
                table.index(['requester_id']);
                table.index(['owner_id']);
                table.index(['status']);
            });
        }
    }

    private async sendUserEmail(to: string, subject: string, html: string, text: string) {
        if (!to) return;
        const from =
            this.configService.get<string>('EMAIL_FROM') ||
            this.configService.get<string>('SMTP_USER');
        if (!from) return;
        try {
            await this.mailerService.sendMail({ from, to, subject, html, text });
        } catch {
            // Best-effort notification only — never block the request workflow on email delivery.
        }
    }

    private assertValidContentType(contentType: string): asserts contentType is DownloadContentType {
        if (!CONTENT_CONFIG[contentType as DownloadContentType]) {
            throw new BadRequestException(`Unknown content type: ${contentType}`);
        }
    }

    private async getContentMeta(contentType: DownloadContentType, contentId: number) {
        const config = CONTENT_CONFIG[contentType];
        const row = await this.knex(config.table).where('id', contentId).first();
        if (!row) throw new NotFoundException('Content not found');
        return {
            title: row[config.titleColumn] || null,
            createdAt: row[config.createdAtColumn] || null,
            ownerId: row[config.ownerColumn] != null ? Number(row[config.ownerColumn]) : null,
        };
    }

    private withRequesterName(query: Knex.QueryBuilder) {
        return query
            .leftJoin('users as requester', 'requester.id', 'download_requests.requester_id')
            .select(
                'download_requests.*',
                'requester.full_name as requesterName',
                'requester.email as requesterEmail',
            );
    }

    async createRequest(contentType: string, contentId: number, requesterId: number) {
        this.assertValidContentType(contentType);
        const meta = await this.getContentMeta(contentType, contentId);

        if (meta.ownerId != null && meta.ownerId === requesterId) {
            throw new BadRequestException('You already own this content');
        }

        const existingPending = await this.knex('download_requests')
            .where({ content_type: contentType, content_id: contentId, requester_id: requesterId, status: 'pending' })
            .first();
        if (existingPending) {
            throw new BadRequestException('You already have a pending request for this item');
        }

        const [id] = await this.knex('download_requests').insert({
            content_type: contentType,
            content_id: contentId,
            content_title: meta.title,
            content_created_at: meta.createdAt,
            owner_id: meta.ownerId,
            requester_id: requesterId,
            status: 'pending',
            requested_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        });

        await this.activityService.log(
            requesterId,
            'download-requests',
            `Requested to download ${contentType} #${contentId}`,
        );

        if (meta.ownerId != null) {
            const owner = await this.knex('users').where('id', meta.ownerId).first();
            if (owner?.email) {
                await this.sendUserEmail(
                    owner.email,
                    'New download request on Roots Egypt',
                    `<p>Someone requested to download "<strong>${meta.title || contentType}</strong>" (#${contentId}). Review it from your Download Requests page.</p>`,
                    `Someone requested to download "${meta.title || contentType}" (#${contentId}). Review it from your Download Requests page.`,
                );
            }
        }

        return this.knex('download_requests').where('id', id).first();
    }

    async listForAdmin(status?: string) {
        let query = this.withRequesterName(this.knex('download_requests'));
        if (status && status !== 'all') query = query.where('download_requests.status', status);
        return query.orderBy('download_requests.requested_at', 'desc');
    }

    async listForOwner(ownerId: number, status?: string) {
        let query = this.withRequesterName(this.knex('download_requests')).where('download_requests.owner_id', ownerId);
        if (status && status !== 'all') query = query.where('download_requests.status', status);
        return query.orderBy('download_requests.requested_at', 'desc');
    }

    async listForRequester(requesterId: number, status?: string) {
        let query = this.knex('download_requests').where('requester_id', requesterId);
        if (status && status !== 'all') query = query.where('status', status);
        return query.orderBy('requested_at', 'desc');
    }

    private async setStatus(
        id: number,
        actorId: number,
        status: 'approved' | 'rejected',
        options: { requireOwnerMatch?: boolean },
    ) {
        const request = await this.knex('download_requests').where('id', id).first();
        if (!request) throw new NotFoundException('Download request not found');
        if (request.status !== 'pending') {
            throw new BadRequestException('This request has already been processed');
        }
        if (options.requireOwnerMatch && Number(request.owner_id) !== Number(actorId)) {
            throw new ForbiddenException('You do not own this content');
        }

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await this.knex('download_requests').where('id', id).update({
            status,
            processed_at: now,
            processed_by: actorId,
        });

        await this.activityService.log(
            actorId,
            'download-requests',
            `${status === 'approved' ? 'Approved' : 'Rejected'} download request #${id}`,
        );

        const requester = await this.knex('users').where('id', request.requester_id).first();
        if (requester?.email) {
            const verb = status === 'approved' ? 'approved' : 'declined';
            await this.sendUserEmail(
                requester.email,
                `Your download request was ${verb}`,
                `<p>Your request to download "<strong>${request.content_title || request.content_type}</strong>" was ${verb}.</p>`,
                `Your request to download "${request.content_title || request.content_type}" was ${verb}.`,
            );
        }

        return this.knex('download_requests').where('id', id).first();
    }

    approveAsAdmin(id: number, actorId: number) {
        return this.setStatus(id, actorId, 'approved', {});
    }

    rejectAsAdmin(id: number, actorId: number) {
        return this.setStatus(id, actorId, 'rejected', {});
    }

    approveAsOwner(id: number, actorId: number) {
        return this.setStatus(id, actorId, 'approved', { requireOwnerMatch: true });
    }

    rejectAsOwner(id: number, actorId: number) {
        return this.setStatus(id, actorId, 'rejected', { requireOwnerMatch: true });
    }

    async hasApprovedAccess(contentType: string, contentId: number, userId: number): Promise<boolean> {
        if (!CONTENT_CONFIG[contentType as DownloadContentType]) return false;
        const row = await this.knex('download_requests')
            .where({ content_type: contentType, content_id: contentId, requester_id: userId, status: 'approved' })
            .first();
        return !!row;
    }

    async myRequestStatus(contentType: string, contentId: number, userId: number) {
        this.assertValidContentType(contentType);
        const row = await this.knex('download_requests')
            .where({ content_type: contentType, content_id: contentId, requester_id: userId })
            .orderBy('requested_at', 'desc')
            .first();
        return row ? { status: row.status, requestId: row.id } : { status: null, requestId: null };
    }
}
