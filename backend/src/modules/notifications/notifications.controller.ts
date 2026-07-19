import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@Query("limit") limit?: string) {
    const parsedLimit = Number(limit);
    const items = await this.notificationsService.list(
      Number.isFinite(parsedLimit) ? parsedLimit : 50,
    );
    return { items };
  }

  @Post()
  async createManual(@Body() body: { title?: string; body?: string }) {
    return {
      item: {
        id: `manual-${Date.now()}`,
        title: body?.title || "Notification",
        body: body?.body,
        createdAt: Date.now(),
        read: false,
        type: "manual",
      },
    };
  }

  @Post(":id/read")
  async markRead(@Param("id") id: string) {
    return this.notificationsService.markRead(id);
  }

  @Put("read-all")
  async markAllRead() {
    return this.notificationsService.markAllRead();
  }
}
