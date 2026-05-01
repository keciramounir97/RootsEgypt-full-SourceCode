import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  UseGuards,
} from "@nestjs/common";
import { MailerService } from "../../common/mailer/mailer.service";
import { ConfigService } from "@nestjs/config";
import { ActivityService } from "../activity/activity.service";
import { ContactDataService } from "./contact-data.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller()
export class NewsletterController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly activityService: ActivityService,
    private readonly contactDataService: ContactDataService,
  ) {}

  @Post("newsletter/subscribe")
  async subscribe(@Body() body: { email?: string }) {
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    if (!email) {
      throw new BadRequestException("Email is required");
    }
    try {
      await this.contactDataService.upsertNewsletterSubscriber(email);
    } catch (err) {
      console.error("Newsletter persistence error:", err?.message || err);
    }
    const from =
      this.configService.get<string>("EMAIL_FROM") ||
      this.configService.get<string>("SMTP_USER");
    if (!from) {
      return { message: "Subscribed. Confirmation email may be delayed." };
    }
    try {
      try {
        await this.activityService.log(
          null,
          "notifications",
          `New newsletter subscriber: ${email}`,
        );
      } catch (err) {
        console.error("Newsletter activity log error:", err?.message || err);
      }
      await this.mailerService.sendMail({
        from: from,
        to: email,
        subject: "RootsEgypt Newsletter",
        text: `Thanks for joining RootsEgypt. We will reach out to you soon at ${email}.`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #2c1810;">
            <h2 style="color:#0f2742;">Welcome to RootsEgypt</h2>
            <p>Thanks for joining our newsletter.</p>
            <p>We will reach out to you soon at <strong>${email}</strong>.</p>
            <p style="margin-top:20px;">- RootsEgypt</p>
          </div>
        `,
      });

      return { message: "Subscribed" };
    } catch (err) {
      console.error("Newsletter subscribe error:", err?.message || err);
      return { message: "Subscribed. Confirmation email may be delayed." };
    }
  }

  @Get("admin/newsletter/subscribers")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  async listSubscribers() {
    return this.contactDataService.listNewsletterSubscribers();
  }
}
