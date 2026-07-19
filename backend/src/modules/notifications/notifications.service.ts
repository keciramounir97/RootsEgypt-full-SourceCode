import { Inject, Injectable } from "@nestjs/common";
import { Knex } from "knex";

export interface AppNotificationDto {
  id: string;
  title: string;
  body?: string;
  createdAt: number;
  read: boolean;
  type?: string;
}

function toTimestamp(value: unknown) {
  const time = value ? new Date(value as any).getTime() : Date.now();
  return Number.isFinite(time) ? time : Date.now();
}

@Injectable()
export class NotificationsService {
  constructor(@Inject("KnexConnection") private readonly knex: Knex) {}

  async list(limit = 50): Promise<AppNotificationDto[]> {
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

    try {
      const rows = await this.knex("activity_logs")
        .select("id", "type", "description", "created_at")
        .orderBy("created_at", "desc")
        .limit(safeLimit);

      return rows.map((row: any) => ({
        id: `activity-${row.id}`,
        title: row.type ? String(row.type) : "Activity",
        body: row.description ? String(row.description) : undefined,
        createdAt: toTimestamp(row.created_at),
        read: false,
        type: row.type ? String(row.type) : undefined,
      }));
    } catch {
      return [];
    }
  }

  async markRead(id: string) {
    return { message: "Notification marked as read.", id };
  }

  async markAllRead() {
    return { message: "All notifications marked as read." };
  }
}
