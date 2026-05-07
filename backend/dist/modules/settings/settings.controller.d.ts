import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/settings.dto";
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<{
        allowRegistration: boolean;
        defaultLanguage: string;
        notifyAdmins: boolean;
        activityRetentionDays: number;
    }>;
    updateSettings(body: UpdateSettingsDto, req: any): Promise<{
        allowRegistration: boolean;
        defaultLanguage: string;
        notifyAdmins: boolean;
        activityRetentionDays: number;
    }>;
}
export declare class PublicSiteImagesController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSiteImages(): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
}
export declare class AdminSiteImagesController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSiteImages(): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    getHeroImages(): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    updateHeroOptions(body: any, req: any): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    addHeroImages(files: Express.Multer.File[], req: any): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    reorderHeroImages(body: any, req: any): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    updateHeroImage(id: number, body: any, req: any): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    deleteHeroImage(id: number, req: any): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    getBackgroundImage(): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    updateBackgroundOptions(body: any, req: any): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    addBackgroundImages(files: Express.Multer.File[], req: any): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    deleteBackgroundImage(id: number, req: any): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
    deleteBackgroundImages(req: any): Promise<{
        heroUseDefault: boolean;
        backgroundUseDefault: boolean;
        heroImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImages: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        }[];
        backgroundImage: {
            id: number;
            imagePath: string;
            sortOrder: number;
            title?: string | null;
            caption?: string | null;
            createdAt?: string;
            updatedAt?: string;
        } | null;
    }>;
}
