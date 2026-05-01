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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterController = void 0;
const common_1 = require("@nestjs/common");
const mailer_service_1 = require("../../common/mailer/mailer.service");
const config_1 = require("@nestjs/config");
const activity_service_1 = require("../activity/activity.service");
const contact_data_service_1 = require("./contact-data.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let NewsletterController = class NewsletterController {
    constructor(mailerService, configService, activityService, contactDataService) {
        this.mailerService = mailerService;
        this.configService = configService;
        this.activityService = activityService;
        this.contactDataService = contactDataService;
    }
    async subscribe(body) {
        var _a;
        const email = String((_a = body === null || body === void 0 ? void 0 : body.email) !== null && _a !== void 0 ? _a : "")
            .trim()
            .toLowerCase();
        if (!email) {
            throw new common_1.BadRequestException("Email is required");
        }
        try {
            await this.contactDataService.upsertNewsletterSubscriber(email);
        }
        catch (err) {
            console.error("Newsletter persistence error:", (err === null || err === void 0 ? void 0 : err.message) || err);
        }
        const from = this.configService.get("EMAIL_FROM") ||
            this.configService.get("SMTP_USER");
        if (!from) {
            return { message: "Subscribed. Confirmation email may be delayed." };
        }
        try {
            try {
                await this.activityService.log(null, "notifications", `New newsletter subscriber: ${email}`);
            }
            catch (err) {
                console.error("Newsletter activity log error:", (err === null || err === void 0 ? void 0 : err.message) || err);
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
        }
        catch (err) {
            console.error("Newsletter subscribe error:", (err === null || err === void 0 ? void 0 : err.message) || err);
            return { message: "Subscribed. Confirmation email may be delayed." };
        }
    }
    async listSubscribers() {
        return this.contactDataService.listNewsletterSubscribers();
    }
};
exports.NewsletterController = NewsletterController;
__decorate([
    (0, common_1.Post)("newsletter/subscribe"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NewsletterController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Get)("admin/newsletter/subscribers"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("admin", "super_admin"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewsletterController.prototype, "listSubscribers", null);
exports.NewsletterController = NewsletterController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [mailer_service_1.MailerService,
        config_1.ConfigService,
        activity_service_1.ActivityService,
        contact_data_service_1.ContactDataService])
], NewsletterController);
//# sourceMappingURL=newsletter.controller.js.map