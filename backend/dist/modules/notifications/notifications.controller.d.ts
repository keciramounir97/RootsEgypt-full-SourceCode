import { NotificationsService } from "./notifications.service";
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(limit?: string): Promise<{
        items: import("./notifications.service").AppNotificationDto[];
    }>;
    createManual(body: {
        title?: string;
        body?: string;
    }): Promise<{
        item: {
            id: string;
            title: string;
            body: string;
            createdAt: number;
            read: boolean;
            type: string;
        };
    }>;
    markRead(id: string): Promise<{
        message: string;
        id: string;
    }>;
    markAllRead(): Promise<{
        message: string;
    }>;
}
