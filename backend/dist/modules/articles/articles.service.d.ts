import { OnModuleInit } from '@nestjs/common';
import { ActivityService } from '../activity/activity.service';
export declare class ArticlesService implements OnModuleInit {
    private readonly knex;
    private readonly activityService;
    private readonly logger;
    private readonly imageExtensions;
    private seedPromise;
    private seedEnsured;
    constructor(knex: any, activityService: ActivityService);
    onModuleInit(): Promise<void>;
    private ensureArticleSchema;
    private addArticleColumn;
    private backfillArticleDefaults;
    private buildTitle;
    private parseMedia;
    private serializeMedia;
    private parseBoolean;
    private parseComments;
    private formatArticle;
    private articleQuery;
    private findArticleRow;
    private seedAdmins;
    private copyBundledGalleryAssets;
    private ensureSeedPosts;
    private seedArticlePosts;
    listPublic(): Promise<any>;
    getPublic(id: number): Promise<any>;
    listByUser(userId: number): Promise<any>;
    listAdmin(): Promise<any>;
    findOne(id: number): Promise<any>;
    private resolveAuthorName;
    create(data: any, userId: number): Promise<any>;
    update(id: number, data: any, userId: number, userRole: number): Promise<any>;
    delete(id: number, userId: number, userRole: number): Promise<{
        message: string;
    }>;
    like(id: number, userId: number): Promise<{
        id: number;
        likes: any;
    }>;
}
