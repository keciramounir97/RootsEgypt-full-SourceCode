import { ActivityService } from '../activity/activity.service';
type SuggestionStatus = 'pending' | 'approved' | 'rejected';
export declare class SuggestionsService {
    private readonly knex;
    private readonly activityService;
    constructor(knex: any, activityService: ActivityService);
    private now;
    private clean;
    private mapRow;
    private querySuggestions;
    create(data: any): Promise<{
        id: any;
        type: any;
        category: any;
        contentTitle: any;
        userId: string;
        userName: any;
        userEmail: any;
        userPhone: any;
        message: any;
        status: any;
        createdAt: any;
        processedAt: any;
        processedBy: any;
    }>;
    listAdmin(): Promise<any>;
    listPublic(): Promise<any>;
    updateStatus(id: number, status: SuggestionStatus, adminId: number): Promise<{
        id: any;
        type: any;
        category: any;
        contentTitle: any;
        userId: string;
        userName: any;
        userEmail: any;
        userPhone: any;
        message: any;
        status: any;
        createdAt: any;
        processedAt: any;
        processedBy: any;
    }>;
}
export {};
