import { Injectable, Inject, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { Audio } from '../../models/Audio';
import { ActivityService } from '../activity/activity.service';
import { resolveStoredFilePath, safeUnlink, UPLOADS_DIR } from '../../common/utils/file.utils';
import * as path from 'path';

export const AUDIO_UPLOADS_DIR = path.join(UPLOADS_DIR, 'audios');

@Injectable()
export class AudiosService implements OnModuleInit {
    constructor(
        @Inject('KnexConnection') private readonly knex,
        private readonly activityService: ActivityService,
    ) {}

    async onModuleInit() {
        try {
            const exists = await this.knex.schema.hasTable('audios');
            if (!exists) {
                await this.knex.schema.createTable('audios', (table) => {
                    table.increments('id').primary();
                    table.string('title', 255).notNullable();
                    table.text('description').nullable();
                    table.string('audio_path', 512).nullable();
                    table.integer('duration').nullable();
                    table.string('category', 100).nullable();
                    table.string('archive_source', 255).nullable();
                    table.integer('uploaded_by').unsigned().nullable();
                    table.boolean('is_public').defaultTo(true);
                    table.integer('likes').defaultTo(0);
                    table.timestamp('created_at').defaultTo(this.knex.fn.now());
                    table.timestamp('updated_at').defaultTo(this.knex.fn.now());
                });
                return;
            }

            if (!(await this.knex.schema.hasColumn('audios', 'category'))) {
                await this.knex.schema.alterTable('audios', (table) => {
                    table.string('category', 100).nullable();
                });
            }
        } catch (err: any) {
            console.warn(`Audios schema init skipped: ${err?.message || err}`);
        }
    }

    async listPublic() {
        return Audio.query(this.knex).where('is_public', true).orderBy('created_at', 'desc');
    }

    async getPublic(id: number) {
        const audio = await Audio.query(this.knex).findById(id).where('is_public', true);
        if (!audio) throw new NotFoundException('Audio not found');
        return audio;
    }

    async listByUser(userId: number) {
        return Audio.query(this.knex).where('uploaded_by', userId).orderBy('created_at', 'desc');
    }

    async listAdmin() {
        return Audio.query(this.knex).orderBy('created_at', 'desc');
    }

    async findOne(id: number) {
        const audio = await Audio.query(this.knex).findById(id);
        if (!audio) throw new NotFoundException('Audio not found');
        return audio;
    }

    async create(data: any, userId: number, file?: Express.Multer.File) {
        const audioPath = file ? `/uploads/audios/${file.filename}` : null;

        const audio = await Audio.query(this.knex).insertAndFetch({
            title: data.title,
            description: data.description || null,
            audio_path: audioPath,
            duration: data.duration ? Number(data.duration) : null,
            category: data.category || null,
            archive_source: data.archiveSource || null,
            uploaded_by: userId,
            is_public: data.isPublic !== 'false' && data.isPublic !== false,
            likes: 0,
        });

        await this.activityService.log(userId, 'audios', `Uploaded audio: ${data.title}`);
        return audio;
    }

    async update(id: number, data: any, userId: number, userRole: number, file?: Express.Multer.File) {
        const audio = await this.findOne(id);
        const roleId = Number(userRole ?? 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = audio.uploaded_by === userId;
        if (!isAdmin && !isOwner) throw new ForbiddenException('Forbidden');

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.duration !== undefined) updateData.duration = Number(data.duration);
        if (data.category !== undefined) updateData.category = data.category;
        if (data.archiveSource !== undefined) updateData.archive_source = data.archiveSource;
        if (data.isPublic !== undefined) updateData.is_public = data.isPublic !== 'false' && data.isPublic !== false;

        if (file) {
            if (audio.audio_path) safeUnlink(resolveStoredFilePath(audio.audio_path));
            updateData.audio_path = `/uploads/audios/${file.filename}`;
        }

        await Audio.query(this.knex).patch(updateData).where('id', id);
        await this.activityService.log(userId, 'audios', `Updated audio: ${audio.title}`);
        return { id };
    }

    async delete(id: number, userId: number, userRole: number) {
        const audio = await this.findOne(id);
        const roleId = Number(userRole ?? 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = audio.uploaded_by === userId;
        if (!isAdmin && !isOwner) throw new ForbiddenException('Forbidden');

        if (audio.audio_path) safeUnlink(resolveStoredFilePath(audio.audio_path));
        await Audio.query(this.knex).deleteById(id);
        await this.activityService.log(userId, 'audios', `Deleted audio: ${audio.title}`);
        return { message: 'Deleted' };
    }
}
