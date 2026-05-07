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
var ArticlesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const activity_service_1 = require("../activity/activity.service");
const file_utils_1 = require("../../common/utils/file.utils");
const fs = require("fs");
const path = require("path");
let ArticlesService = ArticlesService_1 = class ArticlesService {
    constructor(knex, activityService) {
        this.knex = knex;
        this.activityService = activityService;
        this.logger = new common_1.Logger(ArticlesService_1.name);
        this.imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
        this.seedPromise = null;
        this.seedEnsured = false;
    }
    async onModuleInit() {
        await this.ensureArticleSchema();
    }
    async ensureArticleSchema() {
        const exists = await this.knex.schema.hasTable('articles');
        if (!exists) {
            await this.knex.schema.createTable('articles', (table) => {
                table.increments('id').primary();
                table.string('title', 255).nullable();
                table.string('category', 255).nullable();
                table.text('content').notNullable();
                table.integer('author_id').unsigned().nullable();
                table.string('author_name', 255).nullable();
                table.text('images').nullable();
                table.text('videos').nullable();
                table.text('comments').nullable();
                table.string('visibility', 50).defaultTo('public');
                table.integer('likes').defaultTo(0);
                table.boolean('is_public').defaultTo(true);
                table.string('seed_key', 120).unique().nullable();
                table.timestamp('created_at').defaultTo(this.knex.fn.now());
                table.timestamp('updated_at').defaultTo(this.knex.fn.now());
                table.index(['is_public', 'created_at']);
                table.index(['author_id', 'created_at']);
            });
            return;
        }
        await this.addArticleColumn('title', (table) => table.string('title', 255).nullable());
        await this.addArticleColumn('category', (table) => table.string('category', 255).nullable());
        await this.addArticleColumn('author_id', (table) => table.integer('author_id').unsigned().nullable());
        await this.addArticleColumn('author_name', (table) => table.string('author_name', 255).nullable());
        await this.addArticleColumn('images', (table) => table.text('images').nullable());
        await this.addArticleColumn('videos', (table) => table.text('videos').nullable());
        await this.addArticleColumn('comments', (table) => table.text('comments').nullable());
        await this.addArticleColumn('visibility', (table) => table.string('visibility', 50).defaultTo('public'));
        await this.addArticleColumn('likes', (table) => table.integer('likes').defaultTo(0));
        await this.addArticleColumn('is_public', (table) => table.boolean('is_public').defaultTo(true));
        await this.addArticleColumn('seed_key', (table) => table.string('seed_key', 120).unique().nullable());
        await this.addArticleColumn('created_at', (table) => table.timestamp('created_at').defaultTo(this.knex.fn.now()));
        await this.addArticleColumn('updated_at', (table) => table.timestamp('updated_at').defaultTo(this.knex.fn.now()));
        await this.backfillArticleDefaults();
    }
    async addArticleColumn(column, build) {
        if (await this.knex.schema.hasColumn('articles', column))
            return;
        await this.knex.schema.alterTable('articles', build);
    }
    async backfillArticleDefaults() {
        const rows = await this.knex('articles')
            .select('id', 'title', 'content', 'visibility', 'is_public', 'likes')
            .limit(500);
        for (const row of rows) {
            const patch = {};
            if (!row.title)
                patch.title = this.buildTitle(null, row.content);
            if (!row.visibility)
                patch.visibility = 'public';
            if (row.likes === null || row.likes === undefined)
                patch.likes = 0;
            if (row.is_public === null || row.is_public === undefined) {
                patch.is_public = String(row.visibility || 'public').toLowerCase() !== 'private';
            }
            if (Object.keys(patch).length) {
                await this.knex('articles').where('id', row.id).update(patch);
            }
        }
    }
    buildTitle(rawTitle, rawContent) {
        const explicit = String(rawTitle || '').trim();
        if (explicit)
            return explicit.slice(0, 255);
        const content = String(rawContent || '').replace(/\s+/g, ' ').trim();
        if (!content)
            return 'Heritage post';
        return content.slice(0, 90);
    }
    parseMedia(value) {
        if (!value)
            return [];
        if (Array.isArray(value)) {
            return value.map((item) => String(item || '').trim()).filter(Boolean);
        }
        if (typeof value === 'object') {
            const url = value.url || value.src || value.path || value.image_path;
            return url ? [String(url).trim()] : [];
        }
        const raw = String(value || '').trim();
        if (!raw)
            return [];
        try {
            const parsed = JSON.parse(raw);
            return this.parseMedia(parsed);
        }
        catch (_a) {
            return raw
                .split(/\r?\n/)
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }
    serializeMedia(value) {
        const media = this.parseMedia(value);
        return media.length ? JSON.stringify(media) : null;
    }
    parseBoolean(value) {
        if (typeof value === 'boolean')
            return value;
        if (typeof value === 'number')
            return value === 1;
        const raw = String(value || '').trim().toLowerCase();
        return raw === 'true' || raw === '1' || raw === 'yes';
    }
    parseComments(value) {
        if (!value)
            return [];
        if (Array.isArray(value))
            return value;
        try {
            const parsed = JSON.parse(String(value));
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (_a) {
            return [];
        }
    }
    formatArticle(row) {
        if (!row)
            return row;
        const userName = row.userName || row.author_name || row.authorFullName || 'RootsEgypt Admin';
        return Object.assign(Object.assign({}, row), { title: row.title || this.buildTitle(null, row.content), images: this.parseMedia(row.images), videos: this.parseMedia(row.videos), comments: this.parseComments(row.comments), createdAt: row.created_at || row.createdAt, updatedAt: row.updated_at || row.updatedAt, userId: row.author_id, userName, author: row.author_id
                ? {
                    id: row.author_id,
                    full_name: userName,
                    fullName: userName,
                    email: row.authorEmail || null,
                }
                : null, isPublic: row.is_public === true || row.is_public === 1 || row.is_public === '1' });
    }
    articleQuery() {
        return this.knex('articles')
            .leftJoin('users', 'articles.author_id', 'users.id')
            .select('articles.*', 'users.full_name as userName', 'users.email as authorEmail');
    }
    async findArticleRow(id) {
        const article = await this.articleQuery().where('articles.id', id).first();
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        return article;
    }
    seedAdmins() {
        return [
            {
                email: 'karimadmin@rootsegypt.org',
                fullName: 'Karim Admin',
                posts: [
                    {
                        title: 'Family archive photo from the RootsEgypt gallery',
                        content: 'Karim Admin shared a newly organized Egyptian family archive photo. These gallery images are connected to the article feed so every post can carry its historical context.',
                        image: '/uploads/gallery/seed-galleryimage.png',
                        likes: 18,
                    },
                    {
                        title: 'A preserved portrait for Egyptian genealogy notes',
                        content: 'This portrait was added as a visual note for the RootsEgypt archive. Keeping the image beside the story makes it easier to verify names, places, and family branches later.',
                        image: '/uploads/gallery/seed-galleryimage2.png',
                        likes: 24,
                    },
                    {
                        title: 'Archive detail prepared for community review',
                        content: 'Karim Admin prepared this gallery detail for review. The post keeps the photo visible in both the public article feed and the admin editor.',
                        image: '/uploads/gallery/seed-galleryimage3.png',
                        likes: 16,
                    },
                ],
            },
            {
                email: 'kameladmin@rootsegypt.org',
                fullName: 'Kamel Admin',
                posts: [
                    {
                        title: 'Photo note linked to a family branch',
                        content: 'Kamel Admin posted this image while checking an Egyptian family branch. The photo is stored in uploads and can be edited from the admin article manager.',
                        image: '/uploads/gallery/seed-galleryimage4.png',
                        likes: 21,
                    },
                    {
                        title: 'Gallery image prepared for the heritage feed',
                        content: 'A public gallery image has been attached to this story so visitors can see the material directly instead of opening a separate archive page.',
                        image: '/uploads/gallery/seed-galleryimage5.png',
                        likes: 14,
                    },
                    {
                        title: 'Egyptian migration story with a real gallery photo',
                        content: 'Kamel Admin added this post as a short migration note across Egyptian regions and the diaspora. The attached photo comes from the bundled gallery assets and is ready for admin editing.',
                        image: '/uploads/gallery/seed-galleryimage6.png',
                        likes: 19,
                    },
                ],
            },
            {
                email: 'devteam@rootsegypt.org',
                fullName: 'Dev Team Admin',
                posts: [
                    {
                        title: 'Article media rendering smoke post',
                        content: 'Dev Team Admin published this post to verify that article images render from the same upload folder used by the gallery.',
                        image: '/uploads/gallery/seed-galleryimage7.png',
                        likes: 11,
                    },
                    {
                        title: 'Admin-editable article photo check',
                        content: 'This post checks the admin edit flow with a real uploaded image path. Titles, visibility, and media can be changed from the admin articles page.',
                        image: '/uploads/gallery/seed-galleryimage8.png',
                        likes: 13,
                    },
                    {
                        title: 'Public feed photo display check',
                        content: 'The final smoke post verifies that future article media follows the same URL normalization path as existing seeded gallery images.',
                        image: '/uploads/gallery/seed-galleryimage9.png',
                        likes: 17,
                    },
                ],
            },
        ];
    }
    async copyBundledGalleryAssets() {
        const backendRoot = path.resolve(__dirname, '..', '..', '..');
        const assetsDir = path.resolve(backendRoot, '..', 'frontend', 'src', 'assets');
        if (!fs.existsSync(assetsDir))
            return;
        const entries = await fs.promises.readdir(assetsDir, { withFileTypes: true });
        const galleryAssets = entries.filter((entry) => {
            const ext = path.extname(entry.name).toLowerCase();
            return (entry.isFile() &&
                /^galleryimage(?:\d+)?\.(?:jpe?g|png|gif|webp)$/i.test(entry.name) &&
                this.imageExtensions.has(ext));
        });
        await fs.promises.mkdir(file_utils_1.GALLERY_UPLOADS_DIR, { recursive: true });
        for (const asset of galleryAssets) {
            const destination = path.join(file_utils_1.GALLERY_UPLOADS_DIR, `seed-${asset.name}`);
            if (fs.existsSync(destination))
                continue;
            await fs.promises.copyFile(path.join(assetsDir, asset.name), destination);
        }
    }
    async ensureSeedPosts() {
        if (this.seedEnsured)
            return;
        if (!this.seedPromise) {
            this.seedPromise = this.seedArticlePosts()
                .then(() => {
                this.seedEnsured = true;
            })
                .catch((error) => {
                this.logger.warn(`Article seed skipped: ${(error === null || error === void 0 ? void 0 : error.message) || error}`);
            })
                .finally(() => {
                this.seedPromise = null;
            });
        }
        await this.seedPromise;
    }
    async seedArticlePosts() {
        await this.ensureArticleSchema();
        if (!(await this.knex.schema.hasTable('users')))
            return;
        await this.copyBundledGalleryAssets();
        const now = Date.now();
        const seedAdmins = this.seedAdmins();
        let offset = 0;
        for (const seedAdmin of seedAdmins) {
            const user = await this.knex('users')
                .where({ email: seedAdmin.email.toLowerCase() })
                .orWhere({ email: seedAdmin.email })
                .first();
            if (!user)
                continue;
            for (let index = 0; index < seedAdmin.posts.length; index += 1) {
                const post = seedAdmin.posts[index];
                const seedKey = `${seedAdmin.email}:${index + 1}`;
                const exists = await this.knex('articles').where({ seed_key: seedKey }).first();
                if (exists)
                    continue;
                const createdAt = new Date(now - (offset + 2) * 3600 * 1000)
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' ');
                offset += 1;
                await this.knex('articles').insert({
                    title: post.title,
                    content: post.content,
                    author_id: user.id,
                    author_name: user.full_name || seedAdmin.fullName,
                    images: JSON.stringify([post.image]),
                    videos: JSON.stringify([]),
                    comments: JSON.stringify([]),
                    visibility: 'public',
                    likes: post.likes,
                    is_public: true,
                    seed_key: seedKey,
                    created_at: createdAt,
                    updated_at: createdAt,
                });
            }
        }
    }
    async listPublic() {
        await this.ensureSeedPosts();
        const rows = await this.articleQuery()
            .where((builder) => {
            builder.where('articles.is_public', true).orWhereNull('articles.is_public');
        })
            .whereNot('articles.visibility', 'private')
            .orderBy('articles.created_at', 'desc');
        return rows.map((row) => this.formatArticle(row));
    }
    async getPublic(id) {
        await this.ensureSeedPosts();
        const article = await this.articleQuery()
            .where('articles.id', id)
            .where((builder) => {
            builder.where('articles.is_public', true).orWhereNull('articles.is_public');
        })
            .whereNot('articles.visibility', 'private')
            .first();
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        return this.formatArticle(article);
    }
    async listByUser(userId) {
        await this.ensureSeedPosts();
        const rows = await this.articleQuery()
            .where('articles.author_id', userId)
            .orderBy('articles.created_at', 'desc');
        return rows.map((row) => this.formatArticle(row));
    }
    async listAdmin() {
        await this.ensureSeedPosts();
        const rows = await this.articleQuery().orderBy('articles.created_at', 'desc');
        return rows.map((row) => this.formatArticle(row));
    }
    async findOne(id) {
        return this.formatArticle(await this.findArticleRow(id));
    }
    async resolveAuthorName(userId, data) {
        const explicit = String(data.author_name || data.userName || data.user_name || '').trim();
        if (explicit)
            return explicit;
        const user = await this.knex('users').select('full_name').where({ id: userId }).first();
        return (user === null || user === void 0 ? void 0 : user.full_name) || null;
    }
    async create(data, userId) {
        await this.ensureArticleSchema();
        const content = String(data.content || '').trim();
        const title = this.buildTitle(data.title, content);
        const visibility = data.visibility || 'public';
        const isPublic = data.is_public !== undefined
            ? this.parseBoolean(data.is_public)
            : data.isPublic !== undefined
                ? this.parseBoolean(data.isPublic)
                : String(visibility).toLowerCase() !== 'private';
        const [id] = await this.knex('articles').insert({
            title,
            content,
            author_id: userId,
            author_name: await this.resolveAuthorName(userId, data),
            category: data.category || null,
            images: this.serializeMedia(data.images),
            videos: this.serializeMedia(data.videos),
            comments: JSON.stringify([]),
            visibility,
            likes: 0,
            is_public: isPublic,
            created_at: this.knex.fn.now(),
            updated_at: this.knex.fn.now(),
        });
        await this.activityService.log(userId, 'articles', `Posted article: ${title}`);
        return this.formatArticle(await this.findArticleRow(id));
    }
    async update(id, data, userId, userRole) {
        var _a;
        const article = await this.findArticleRow(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = Number(article.author_id) === Number(userId);
        if (!isAdmin && !isOwner)
            throw new common_1.ForbiddenException('Forbidden');
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = this.buildTitle(data.title, (_a = data.content) !== null && _a !== void 0 ? _a : article.content);
        if (data.category !== undefined)
            updateData.category = data.category || null;
        if (data.content !== undefined) {
            updateData.content = String(data.content || '').trim();
            if (data.title === undefined && !article.title) {
                updateData.title = this.buildTitle(null, data.content);
            }
        }
        if (data.visibility !== undefined) {
            updateData.visibility = data.visibility;
            if (data.is_public === undefined && data.isPublic === undefined) {
                updateData.is_public = String(data.visibility).toLowerCase() !== 'private';
            }
        }
        if (data.images !== undefined)
            updateData.images = this.serializeMedia(data.images);
        if (data.videos !== undefined)
            updateData.videos = this.serializeMedia(data.videos);
        if (data.is_public !== undefined)
            updateData.is_public = this.parseBoolean(data.is_public);
        if (data.isPublic !== undefined)
            updateData.is_public = this.parseBoolean(data.isPublic);
        updateData.updated_at = this.knex.fn.now();
        await this.knex('articles').where('id', id).update(updateData);
        await this.activityService.log(userId, 'articles', `Updated article: ${article.title || article.content}`);
        return this.formatArticle(await this.findArticleRow(id));
    }
    async delete(id, userId, userRole) {
        const article = await this.findArticleRow(id);
        const roleId = Number(userRole !== null && userRole !== void 0 ? userRole : 0);
        const isAdmin = roleId === 1 || roleId === 3;
        const isOwner = Number(article.author_id) === Number(userId);
        if (!isAdmin && !isOwner)
            throw new common_1.ForbiddenException('Forbidden');
        await this.knex('articles').delete().where('id', id);
        await this.activityService.log(userId, 'articles', `Deleted article: ${article.title || article.content}`);
        return { message: 'Deleted' };
    }
    async like(id, userId) {
        await this.knex('articles').where('id', id).increment('likes', 1);
        const article = await this.findArticleRow(id);
        await this.activityService.log(userId, 'articles', `Liked article #${id}`);
        return { id, likes: article.likes };
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = ArticlesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KnexConnection')),
    __metadata("design:paramtypes", [Object, activity_service_1.ActivityService])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map