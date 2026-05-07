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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const activity_service_1 = require("../activity/activity.service");
const file_utils_1 = require("../../common/utils/file.utils");
const DEFAULT_SETTINGS = {
    allowRegistration: true,
    defaultLanguage: "en",
    notifyAdmins: true,
    activityRetentionDays: 90,
};
const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);
const SITE_HERO_USE_DEFAULT_KEY = "siteHeroUseDefault";
const SITE_BACKGROUND_USE_DEFAULT_KEY = "siteBackgroundUseDefault";
let SettingsService = class SettingsService {
    constructor(knex, activityService) {
        this.knex = knex;
        this.activityService = activityService;
    }
    async onModuleInit() {
        await this.ensureSettingsSchema();
    }
    async ensureSettingsSchema() {
        if (!(await this.knex.schema.hasTable("app_settings"))) {
            await this.knex.schema.createTable("app_settings", (table) => {
                table.string("key").primary();
                table.text("value").notNullable();
                table.dateTime("updated_at").defaultTo(this.knex.fn.now());
            });
        }
        if (!(await this.knex.schema.hasTable("site_images"))) {
            await this.knex.schema.createTable("site_images", (table) => {
                table.increments("id").primary();
                table.string("type", 40).notNullable();
                table.string("image_path", 512).notNullable();
                table.integer("sort_order").notNullable().defaultTo(0);
                table.dateTime("created_at").defaultTo(this.knex.fn.now());
                table.dateTime("updated_at").defaultTo(this.knex.fn.now());
                table.index(["type", "sort_order"]);
            });
            return;
        }
        if (!(await this.knex.schema.hasColumn("site_images", "updated_at"))) {
            await this.knex.schema.alterTable("site_images", (table) => {
                table.dateTime("updated_at").nullable();
            });
        }
        if (!(await this.knex.schema.hasColumn("site_images", "title"))) {
            await this.knex.schema.alterTable("site_images", (table) => {
                table.string("title", 255).nullable();
            });
        }
        if (!(await this.knex.schema.hasColumn("site_images", "caption"))) {
            await this.knex.schema.alterTable("site_images", (table) => {
                table.text("caption").nullable();
            });
        }
    }
    parseValue(key, value) {
        if (value === undefined || value === null || value === "")
            return DEFAULT_SETTINGS[key];
        if (key === "allowRegistration" || key === "notifyAdmins") {
            return value === "true" || value === "1";
        }
        if (key === "activityRetentionDays") {
            const days = Number(value);
            if (!Number.isFinite(days))
                return DEFAULT_SETTINGS.activityRetentionDays;
            return Math.min(365, Math.max(7, Math.round(days)));
        }
        if (key === "defaultLanguage") {
            return ["en", "fr", "ar", "es"].includes(value)
                ? value
                : DEFAULT_SETTINGS.defaultLanguage;
        }
        return value;
    }
    serializeValue(value) {
        return String(value);
    }
    parseBooleanSetting(value, fallback) {
        if (value === undefined || value === null || value === "")
            return fallback;
        const normalized = String(value).trim().toLowerCase();
        if (["true", "1", "yes"].includes(normalized))
            return true;
        if (["false", "0", "no"].includes(normalized))
            return false;
        return fallback;
    }
    async readSetting(key, fallback) {
        await this.ensureSettingsSchema();
        const row = await this.knex("app_settings").where({ key }).first();
        return (row === null || row === void 0 ? void 0 : row.value) !== undefined && (row === null || row === void 0 ? void 0 : row.value) !== null
            ? String(row.value)
            : fallback;
    }
    async writeSetting(key, value) {
        await this.ensureSettingsSchema();
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        const serialized = String(value);
        const existing = await this.knex("app_settings").where({ key }).first();
        if (existing) {
            await this.knex("app_settings")
                .where({ key })
                .update({ value: serialized, updated_at: now });
        }
        else {
            await this.knex("app_settings").insert({
                key,
                value: serialized,
                updated_at: now,
            });
        }
    }
    formatSiteImage(row) {
        return {
            id: Number(row.id),
            imagePath: row.image_path,
            sortOrder: Number(row.sort_order || 0),
            title: row.title || null,
            caption: row.caption || null,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async getSettings() {
        await this.ensureSettingsSchema();
        const rows = await this.knex("app_settings")
            .whereIn("key", SETTING_KEYS)
            .select("key", "value");
        const stored = new Map(rows.map((row) => [String(row.key), String(row.value)]));
        return {
            allowRegistration: this.parseValue("allowRegistration", stored.get("allowRegistration")),
            defaultLanguage: this.parseValue("defaultLanguage", stored.get("defaultLanguage")),
            notifyAdmins: this.parseValue("notifyAdmins", stored.get("notifyAdmins")),
            activityRetentionDays: this.parseValue("activityRetentionDays", stored.get("activityRetentionDays")),
        };
    }
    async updateSettings(data, actorId) {
        var _a, _b, _c;
        await this.ensureSettingsSchema();
        const current = await this.getSettings();
        const next = {
            allowRegistration: (_a = data.allowRegistration) !== null && _a !== void 0 ? _a : current.allowRegistration,
            defaultLanguage: (_b = data.defaultLanguage) !== null && _b !== void 0 ? _b : current.defaultLanguage,
            notifyAdmins: (_c = data.notifyAdmins) !== null && _c !== void 0 ? _c : current.notifyAdmins,
            activityRetentionDays: data.activityRetentionDays !== undefined
                ? Math.min(365, Math.max(7, Math.round(Number(data.activityRetentionDays))))
                : current.activityRetentionDays,
        };
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        for (const key of SETTING_KEYS) {
            const value = this.serializeValue(next[key]);
            const existing = await this.knex("app_settings").where({ key }).first();
            if (existing) {
                await this.knex("app_settings")
                    .where({ key })
                    .update({ value, updated_at: now });
            }
            else {
                await this.knex("app_settings").insert({ key, value, updated_at: now });
            }
        }
        await this.activityService.log(actorId, "settings", "Updated platform settings");
        return next;
    }
    async getSiteImages() {
        await this.ensureSettingsSchema();
        const [heroDefault, backgroundDefault, heroRows, backgroundRows] = await Promise.all([
            this.readSetting(SITE_HERO_USE_DEFAULT_KEY, "true"),
            this.readSetting(SITE_BACKGROUND_USE_DEFAULT_KEY, "true"),
            this.knex("site_images")
                .where({ type: "hero" })
                .orderBy("sort_order", "asc")
                .orderBy("id", "asc"),
            this.knex("site_images")
                .where({ type: "background" })
                .orderBy("sort_order", "asc")
                .orderBy("id", "asc"),
        ]);
        const formattedBackgroundImages = backgroundRows.map((row) => this.formatSiteImage(row));
        return {
            heroUseDefault: this.parseBooleanSetting(heroDefault, true),
            backgroundUseDefault: this.parseBooleanSetting(backgroundDefault, true),
            heroImages: heroRows.map((row) => this.formatSiteImage(row)),
            backgroundImages: formattedBackgroundImages,
            backgroundImage: formattedBackgroundImages[formattedBackgroundImages.length - 1] || null,
        };
    }
    async updateHeroOptions(data, actorId) {
        if ((data === null || data === void 0 ? void 0 : data.heroUseDefault) !== undefined) {
            await this.writeSetting(SITE_HERO_USE_DEFAULT_KEY, this.parseBooleanSetting(data.heroUseDefault, true));
            await this.activityService.log(actorId, "settings", "Updated hero image visibility");
        }
        return this.getSiteImages();
    }
    async addHeroImages(files, actorId) {
        await this.ensureSettingsSchema();
        if (!(files === null || files === void 0 ? void 0 : files.length))
            throw new common_1.BadRequestException("At least one hero image is required");
        const maxRow = await this.knex("site_images")
            .where({ type: "hero" })
            .max("sort_order as max")
            .first();
        let nextOrder = Number((maxRow === null || maxRow === void 0 ? void 0 : maxRow.max) || 0);
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        const rows = files.map((file) => {
            nextOrder += 1;
            return {
                type: "hero",
                image_path: `/uploads/site/${file.filename}`,
                sort_order: nextOrder,
                created_at: now,
                updated_at: now,
            };
        });
        await this.knex("site_images").insert(rows);
        await this.activityService.log(actorId, "settings", `Uploaded ${files.length} hero image(s)`);
        return this.getSiteImages();
    }
    async updateHeroImage(id, data, actorId) {
        await this.ensureSettingsSchema();
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        const update = { updated_at: now };
        if (data.title !== undefined)
            update.title = data.title || null;
        if (data.caption !== undefined)
            update.caption = data.caption || null;
        if (data.sortOrder !== undefined)
            update.sort_order = Number(data.sortOrder);
        await this.knex("site_images").where({ id, type: "hero" }).update(update);
        await this.activityService.log(actorId, "settings", `Updated hero image #${id}`);
        return this.getSiteImages();
    }
    async reorderHeroImages(ids, actorId) {
        await this.ensureSettingsSchema();
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        for (let i = 0; i < ids.length; i++) {
            await this.knex("site_images")
                .where({ id: ids[i], type: "hero" })
                .update({ sort_order: i + 1, updated_at: now });
        }
        await this.activityService.log(actorId, "settings", "Reordered hero images");
        return this.getSiteImages();
    }
    async deleteHeroImage(id, actorId) {
        await this.ensureSettingsSchema();
        const row = await this.knex("site_images")
            .where({ id, type: "hero" })
            .first();
        if (!row)
            return this.getSiteImages();
        (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(row.image_path));
        await this.knex("site_images").where({ id, type: "hero" }).delete();
        await this.activityService.log(actorId, "settings", "Deleted hero image");
        return this.getSiteImages();
    }
    async updateBackgroundOptions(data, actorId) {
        if ((data === null || data === void 0 ? void 0 : data.backgroundUseDefault) !== undefined) {
            await this.writeSetting(SITE_BACKGROUND_USE_DEFAULT_KEY, this.parseBooleanSetting(data.backgroundUseDefault, true));
            await this.activityService.log(actorId, "settings", "Updated background image visibility");
        }
        return this.getSiteImages();
    }
    async addBackgroundImages(files, actorId) {
        await this.ensureSettingsSchema();
        if (!(files === null || files === void 0 ? void 0 : files.length))
            throw new common_1.BadRequestException("At least one background image is required");
        const maxRow = await this.knex("site_images")
            .where({ type: "background" })
            .max("sort_order as max")
            .first();
        let nextOrder = Number((maxRow === null || maxRow === void 0 ? void 0 : maxRow.max) || 0);
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        const rows = files.map((file) => {
            nextOrder += 1;
            return {
                type: "background",
                image_path: `/uploads/site/${file.filename}`,
                sort_order: nextOrder,
                created_at: now,
                updated_at: now,
            };
        });
        await this.knex("site_images").insert(rows);
        await this.activityService.log(actorId, "settings", `Uploaded ${files.length} background image(s)`);
        return this.getSiteImages();
    }
    async deleteBackgroundImage(id, actorId) {
        await this.ensureSettingsSchema();
        const row = await this.knex("site_images")
            .where({ id, type: "background" })
            .first();
        if (!row)
            return this.getSiteImages();
        (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(row.image_path));
        await this.knex("site_images").where({ id, type: "background" }).delete();
        await this.activityService.log(actorId, "settings", "Deleted background image");
        return this.getSiteImages();
    }
    async deleteBackgroundImages(actorId) {
        await this.ensureSettingsSchema();
        const existing = await this.knex("site_images")
            .where({ type: "background" })
            .select("id", "image_path");
        for (const row of existing) {
            (0, file_utils_1.safeUnlink)((0, file_utils_1.resolveStoredFilePath)(row.image_path));
        }
        await this.knex("site_images").where({ type: "background" }).delete();
        await this.activityService.log(actorId, "settings", "Deleted background images");
        return this.getSiteImages();
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("KnexConnection")),
    __metadata("design:paramtypes", [Object, activity_service_1.ActivityService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map