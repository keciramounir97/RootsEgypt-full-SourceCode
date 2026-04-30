"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const config_1 = require("@nestjs/config");
let MailerService = MailerService_1 = class MailerService {
    constructor(configService) {
        this.configService = configService;
        this.transporter = null;
        this.logger = new common_1.Logger(MailerService_1.name);
        this.enabled =
            this.configService.get("SMTP_ENABLED", "true") !== "false";
        if (this.enabled) {
            this.transporter = nodemailer.createTransport({
                host: this.configService.get("SMTP_HOST"),
                port: this.configService.get("SMTP_PORT"),
                secure: this.configService.get("SMTP_SECURE") === "true",
                auth: {
                    user: this.configService.get("SMTP_USER"),
                    pass: this.configService.get("SMTP_PASS"),
                },
            });
        }
        else {
            this.logger.warn("SMTP is disabled (SMTP_ENABLED=false). Emails will not be sent.");
        }
    }
    async sendMail(options) {
        if (!this.enabled || !this.transporter) {
            this.logger.log(`Mail skipped (SMTP disabled): to=${options.to}, subject=${options.subject}`);
            return null;
        }
        return this.transporter.sendMail(options);
    }
};
exports.MailerService = MailerService;
exports.MailerService = MailerService = MailerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailerService);
//# sourceMappingURL=mailer.service.js.map