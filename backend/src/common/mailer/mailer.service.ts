import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailerService.name);
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.enabled =
      this.configService.get<string>("SMTP_ENABLED", "true") !== "false";

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>("SMTP_HOST"),
        port: this.configService.get<number>("SMTP_PORT"),
        secure: this.configService.get<string>("SMTP_SECURE") === "true",
        auth: {
          user: this.configService.get<string>("SMTP_USER"),
          pass: this.configService.get<string>("SMTP_PASS"),
        },
      });
    } else {
      this.logger.warn(
        "SMTP is disabled (SMTP_ENABLED=false). Emails will not be sent.",
      );
    }
  }

  async sendMail(options: nodemailer.SendMailOptions) {
    if (!this.enabled || !this.transporter) {
      this.logger.log(
        `Mail skipped (SMTP disabled): to=${options.to}, subject=${options.subject}`,
      );
      return null;
    }
    return this.transporter.sendMail(options);
  }
}
