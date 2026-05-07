import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from "@nestjs/common";
import { ActivityService } from "../activity/activity.service";
import { UpdateSettingsDto } from "./dto/settings.dto";
import {
  resolveStoredFilePath,
  safeUnlink,
} from "../../common/utils/file.utils";

type SettingsShape = {
  allowRegistration: boolean;
  defaultLanguage: string;
  notifyAdmins: boolean;
  activityRetentionDays: number;
};

type SiteImageRecord = {
  id: number;
  imagePath: string;
  sortOrder: number;
  title?: string | null;
  caption?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type SiteImagesShape = {
  heroUseDefault: boolean;
  backgroundUseDefault: boolean;
  heroImages: SiteImageRecord[];
  backgroundImages: SiteImageRecord[];
  backgroundImage: SiteImageRecord | null;
};

const DEFAULT_SETTINGS: SettingsShape = {
  allowRegistration: true,
  defaultLanguage: "en",
  notifyAdmins: true,
  activityRetentionDays: 90,
};

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as Array<
  keyof SettingsShape
>;
const SITE_HERO_USE_DEFAULT_KEY = "siteHeroUseDefault";
const SITE_BACKGROUND_USE_DEFAULT_KEY = "siteBackgroundUseDefault";

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @Inject("KnexConnection") private readonly knex,
    private readonly activityService: ActivityService,
  ) {}

  async onModuleInit() {
    await this.ensureSettingsSchema();
  }

  private async ensureSettingsSchema() {
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

  private parseValue(
    key: keyof SettingsShape,
    value: string | null | undefined,
  ) {
    if (value === undefined || value === null || value === "")
      return DEFAULT_SETTINGS[key];
    if (key === "allowRegistration" || key === "notifyAdmins") {
      return value === "true" || value === "1";
    }
    if (key === "activityRetentionDays") {
      const days = Number(value);
      if (!Number.isFinite(days)) return DEFAULT_SETTINGS.activityRetentionDays;
      return Math.min(365, Math.max(7, Math.round(days)));
    }
    if (key === "defaultLanguage") {
      return ["en", "fr", "ar", "es"].includes(value)
        ? value
        : DEFAULT_SETTINGS.defaultLanguage;
    }
    return value;
  }

  private serializeValue(value: boolean | number | string) {
    return String(value);
  }

  private parseBooleanSetting(
    value: string | null | undefined,
    fallback: boolean,
  ) {
    if (value === undefined || value === null || value === "") return fallback;
    const normalized = String(value).trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
    return fallback;
  }

  private async readSetting(key: string, fallback: string) {
    await this.ensureSettingsSchema();
    const row = await this.knex("app_settings").where({ key }).first();
    return row?.value !== undefined && row?.value !== null
      ? String(row.value)
      : fallback;
  }

  private async writeSetting(key: string, value: boolean | number | string) {
    await this.ensureSettingsSchema();
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const serialized = String(value);
    const existing = await this.knex("app_settings").where({ key }).first();
    if (existing) {
      await this.knex("app_settings")
        .where({ key })
        .update({ value: serialized, updated_at: now });
    } else {
      await this.knex("app_settings").insert({
        key,
        value: serialized,
        updated_at: now,
      });
    }
  }

  private formatSiteImage(row: any): SiteImageRecord {
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

  async getSettings(): Promise<SettingsShape> {
    await this.ensureSettingsSchema();
    const rows = await this.knex("app_settings")
      .whereIn("key", SETTING_KEYS)
      .select("key", "value");
    const stored = new Map<string, string>(
      rows.map((row: any) => [String(row.key), String(row.value)]),
    );

    return {
      allowRegistration: this.parseValue(
        "allowRegistration",
        stored.get("allowRegistration"),
      ) as boolean,
      defaultLanguage: this.parseValue(
        "defaultLanguage",
        stored.get("defaultLanguage"),
      ) as string,
      notifyAdmins: this.parseValue(
        "notifyAdmins",
        stored.get("notifyAdmins"),
      ) as boolean,
      activityRetentionDays: this.parseValue(
        "activityRetentionDays",
        stored.get("activityRetentionDays"),
      ) as number,
    };
  }

  async updateSettings(
    data: UpdateSettingsDto,
    actorId: number,
  ): Promise<SettingsShape> {
    await this.ensureSettingsSchema();
    const current = await this.getSettings();
    const next: SettingsShape = {
      allowRegistration: data.allowRegistration ?? current.allowRegistration,
      defaultLanguage: data.defaultLanguage ?? current.defaultLanguage,
      notifyAdmins: data.notifyAdmins ?? current.notifyAdmins,
      activityRetentionDays:
        data.activityRetentionDays !== undefined
          ? Math.min(
              365,
              Math.max(7, Math.round(Number(data.activityRetentionDays))),
            )
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
      } else {
        await this.knex("app_settings").insert({ key, value, updated_at: now });
      }
    }

    await this.activityService.log(
      actorId,
      "settings",
      "Updated platform settings",
    );
    return next;
  }

  async getSiteImages(): Promise<SiteImagesShape> {
    await this.ensureSettingsSchema();
    const [heroDefault, backgroundDefault, heroRows, backgroundRows] =
      await Promise.all([
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
    const formattedBackgroundImages = backgroundRows.map((row: any) =>
      this.formatSiteImage(row),
    );

    return {
      heroUseDefault: this.parseBooleanSetting(heroDefault, true),
      backgroundUseDefault: this.parseBooleanSetting(backgroundDefault, true),
      heroImages: heroRows.map((row: any) => this.formatSiteImage(row)),
      backgroundImages: formattedBackgroundImages,
      backgroundImage:
        formattedBackgroundImages[formattedBackgroundImages.length - 1] || null,
    };
  }

  async updateHeroOptions(data: any, actorId: number) {
    if (data?.heroUseDefault !== undefined) {
      await this.writeSetting(
        SITE_HERO_USE_DEFAULT_KEY,
        this.parseBooleanSetting(data.heroUseDefault, true),
      );
      await this.activityService.log(
        actorId,
        "settings",
        "Updated hero image visibility",
      );
    }
    return this.getSiteImages();
  }

  async addHeroImages(files: Express.Multer.File[], actorId: number) {
    await this.ensureSettingsSchema();
    if (!files?.length)
      throw new BadRequestException("At least one hero image is required");

    const maxRow = await this.knex("site_images")
      .where({ type: "hero" })
      .max("sort_order as max")
      .first();
    let nextOrder = Number(maxRow?.max || 0);
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
    await this.activityService.log(
      actorId,
      "settings",
      `Uploaded ${files.length} hero image(s)`,
    );
    return this.getSiteImages();
  }

  async updateHeroImage(
    id: number,
    data: { title?: string; caption?: string; sortOrder?: number },
    actorId: number,
  ) {
    await this.ensureSettingsSchema();
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const update: any = { updated_at: now };
    if (data.title !== undefined) update.title = data.title || null;
    if (data.caption !== undefined) update.caption = data.caption || null;
    if (data.sortOrder !== undefined)
      update.sort_order = Number(data.sortOrder);
    await this.knex("site_images").where({ id, type: "hero" }).update(update);
    await this.activityService.log(
      actorId,
      "settings",
      `Updated hero image #${id}`,
    );
    return this.getSiteImages();
  }

  async reorderHeroImages(ids: number[], actorId: number) {
    await this.ensureSettingsSchema();
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    for (let i = 0; i < ids.length; i++) {
      await this.knex("site_images")
        .where({ id: ids[i], type: "hero" })
        .update({ sort_order: i + 1, updated_at: now });
    }
    await this.activityService.log(
      actorId,
      "settings",
      "Reordered hero images",
    );
    return this.getSiteImages();
  }

  async deleteHeroImage(id: number, actorId: number) {
    await this.ensureSettingsSchema();
    const row = await this.knex("site_images")
      .where({ id, type: "hero" })
      .first();
    if (!row) return this.getSiteImages();
    safeUnlink(resolveStoredFilePath(row.image_path));
    await this.knex("site_images").where({ id, type: "hero" }).delete();
    await this.activityService.log(actorId, "settings", "Deleted hero image");
    return this.getSiteImages();
  }

  async updateBackgroundOptions(data: any, actorId: number) {
    if (data?.backgroundUseDefault !== undefined) {
      await this.writeSetting(
        SITE_BACKGROUND_USE_DEFAULT_KEY,
        this.parseBooleanSetting(data.backgroundUseDefault, true),
      );
      await this.activityService.log(
        actorId,
        "settings",
        "Updated background image visibility",
      );
    }
    return this.getSiteImages();
  }

  async addBackgroundImages(files: Express.Multer.File[], actorId: number) {
    await this.ensureSettingsSchema();
    if (!files?.length)
      throw new BadRequestException(
        "At least one background image is required",
      );

    const maxRow = await this.knex("site_images")
      .where({ type: "background" })
      .max("sort_order as max")
      .first();
    let nextOrder = Number(maxRow?.max || 0);

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
    await this.activityService.log(
      actorId,
      "settings",
      `Uploaded ${files.length} background image(s)`,
    );
    return this.getSiteImages();
  }

  async deleteBackgroundImage(id: number, actorId: number) {
    await this.ensureSettingsSchema();
    const row = await this.knex("site_images")
      .where({ id, type: "background" })
      .first();
    if (!row) return this.getSiteImages();
    safeUnlink(resolveStoredFilePath(row.image_path));
    await this.knex("site_images").where({ id, type: "background" }).delete();
    await this.activityService.log(
      actorId,
      "settings",
      "Deleted background image",
    );
    return this.getSiteImages();
  }

  async deleteBackgroundImages(actorId: number) {
    await this.ensureSettingsSchema();
    const existing = await this.knex("site_images")
      .where({ type: "background" })
      .select("id", "image_path");
    for (const row of existing) {
      safeUnlink(resolveStoredFilePath(row.image_path));
    }
    await this.knex("site_images").where({ type: "background" }).delete();
    await this.activityService.log(
      actorId,
      "settings",
      "Deleted background images",
    );
    return this.getSiteImages();
  }
}
