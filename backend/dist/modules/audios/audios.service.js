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
exports.AudiosService = exports.AUDIO_UPLOADS_DIR = void 0;
const common_1 = require("@nestjs/common");
const Audio_1 = require("../../models/Audio");
const activity_service_1 = require("../activity/activity.service");
const file_utils_1 = require("../../common/utils/file.utils");
const path = require("path");
exports.AUDIO_UPLOADS_DIR = path.join(file_utils_1.UPLOADS_DIR, 'audios');
let AudiosService = class AudiosService {
    constructor(knex, activityService) {
        this.knex = knex;
        this.activityService = activityService;
    }
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
        }
        catch (err) {
            console.warn(`Audios schema init skipped: ${(err === null || err === void 0 ? void 0 : err.message) || err}`);
        }
    }
    async listPublic() {
        return Audio_1.Audio.query(this.knex).where('is_public', true).orderBy('created_at', 'desc');
    }
    async getPublic(id) {
        const audio = await Audio_1.Audio.query(this.knex).findById(id).where('is_public', true);
        if (!audio)
            throw new common_1.NotFoundException('Audio not found');
        return audio;
    }
    async listByUser(userId) {
        return Audio_1.Audio.query(this.knex).where('uploaded_by', userId).orderBy('created_at', 'desc');
    }
    async listAdmin() {
        return Audio_1.Audio.query(this.knex).orderBy('created_at', 'desc');
    }
    async findOne(id) {
        const audio = await Audio_1.Audio.query(this.knex).findById(id);
        if (!audio)
            throw new common_1.NotFoundException('Audio not found');
        return audio;
    }
    async create(data, userId, file) {
        const audioPath = file ? `/uploads/audios/${file.filename}` : null;
        const audio = await Audio_1.Audio.query(this.knex).insertAndFetch({
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
    async update(id, data, userId, userRole, file) {
        const audio = await this.findOne(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = audio.uploaded_by === userId;
        if (!isAdmin && !isOwner)
            throw new common_1.ForbiddenException('Forbidden');
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.duration !== undefined)
            updateData.duration = Number(data.duration);
        if (data.category !== undefined)
            updateData.category = data.category;
        if (data.archiveSource !== undefined)
            updateData.archive_source = data.archiveSource;
        if (data.isPublic !== undefined)
            updateData.is_public = data.isPublic !== 'false' && data.isPublic !== false;
        if (file) {
            if (audio.audio_path)
                (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(audio.audio_path));
            updateData.audio_path = `/uploads/audios/${file.filename}`;
        }
        await Audio_1.Audio.query(this.knex).patch(updateData).where('id', id);
        await this.activityService.log(userId, 'audios', `Updated audio: ${audio.title}`);
        return { id };
    }
    async delete(id, userId, userRole) {
        const audio = await this.findOne(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = audio.uploaded_by === userId;
        if (!isAdmin && !isOwner)
            throw new common_1.ForbiddenException('Forbidden');
        if (audio.audio_path)
            (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(audio.audio_path));
        await Audio_1.Audio.query(this.knex).deleteById(id);
        await this.activityService.log(userId, 'audios', `Deleted audio: ${audio.title}`);
        return { message: 'Deleted' };
    }
};
exports.AudiosService = AudiosService;
exports.AudiosService = AudiosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [Object, activity_service_1.ActivityService])
], AudiosService);
//# sourceMappingURL=audios.service.js.map