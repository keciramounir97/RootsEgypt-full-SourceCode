import { Knex } from "knex";
export interface AppNotificationDto {
    id: string;
    title: string;
    body?: string;
    createdAt: number;
    read: boolean;
    type?: string;
}
export declare class NotificationsService {
    private readonly knex;
    constructor(knex: Knex);
    list(limit?: number): Promise<AppNotificationDto[]>;
    markRead(id: string): Promise<{
        message: string;
        id: string;
    }>;
    markAllRead(): Promise<{
        message: string;
    }>;
}
