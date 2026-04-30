import { ActivityService } from './activity.service';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    getActivities(limit: number, type?: string, q?: string): Promise<{
        id: any;
        type: any;
        description: any;
        user: any;
        date: any;
    }[]>;
}
