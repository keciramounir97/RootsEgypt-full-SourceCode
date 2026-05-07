import { OnModuleInit } from '@nestjs/common';
import { ActivityService } from '../activity/activity.service';
import { UpdateSettingsDto } from './dto/settings.dto';
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
export declare class SettingsService implements OnModuleInit {
    private readonly knex;
    private readonly activityService;
    constructor(knex: any, activityService: ActivityService);
    onModuleInit(): Promise<void>;
    private ensureSettingsSchema;
    private parseValue;
    private serializeValue;
    private parseBooleanSetting;
    private readSetting;
    private writeSetting;
    private formatSiteImage;
    getSettings(): Promise<SettingsShape>;
    updateSettings(data: UpdateSettingsDto, actorId: number): Promise<SettingsShape>;
    getSiteImages(): Promise<SiteImagesShape>;
    updateHeroOptions(data: any, actorId: number): Promise<SiteImagesShape>;
    addHeroImages(files: Express.Multer.File[], actorId: number): Promise<SiteImagesShape>;
    deleteHeroImage(id: number, actorId: number): Promise<SiteImagesShape>;
    updateBackgroundOptions(data: any, actorId: number): Promise<SiteImagesShape>;
    addBackgroundImages(files: Express.Multer.File[], actorId: number): Promise<SiteImagesShape>;
    deleteBackgroundImage(id: number, actorId: number): Promise<SiteImagesShape>;
    deleteBackgroundImages(actorId: number): Promise<SiteImagesShape>;
}
export {};
