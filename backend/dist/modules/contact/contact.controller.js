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
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const mailer_service_1 = require("../../common/mailer/mailer.service");
const config_1 = require("@nestjs/config");
const contact_dto_1 = require("./dto/contact.dto");
const contact_data_service_1 = require("./contact-data.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ContactController = class ContactController {
    constructor(mailerService, configService, contactDataService) {
        this.mailerService = mailerService;
        this.configService = configService;
        this.contactDataService = contactDataService;
    }
    async sendContact(body) {
        const { name, email, message } = body;
        await this.contactDataService.saveContactMessage({
            name: String(name || '').trim(),
            email: String(email || '').trim().toLowerCase(),
            message: String(message || '').trim(),
        });
        const from = this.configService.get('EMAIL_FROM') || this.configService.get('SMTP_USER');
        const to = this.configService.get('SMTP_USER');
        if (!from || !to) {
            return { message: 'Message received. Email delivery is temporarily unavailable.' };
        }
        try {
            const safeMessage = message ? message.replace(/\n/g, '<br>') : '';
            const safeName = String(name !== null && name !== void 0 ? name : '').trim();
            const safeEmail = String(email !== null && email !== void 0 ? email : '').trim();
            await this.mailerService.sendMail({
                from: String(from),
                to: String(to),
                replyTo: safeEmail,
                subject: `New Contact Message from ${safeName}`,
                text: `
          Name: ${safeName}
          Email: ${safeEmail}
          Message:
          ${message}
        `,
                html: `
          <h3>New Contact Message</h3>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background:#f9f9f9; padding:10px; border-left:4px solid #ccc;">
            ${safeMessage}
          </blockquote>
        `,
            });
            return { message: 'Message sent successfully' };
        }
        catch (err) {
            console.error('Contact form mail error:', (err === null || err === void 0 ? void 0 : err.message) || err);
            return { message: 'Message received. Email delivery may be delayed.' };
        }
    }
    async listContactMessages() {
        return this.contactDataService.listContactMessages();
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)('contact'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.ContactDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "sendContact", null);
__decorate([
    (0, common_1.Get)('admin/contact/messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "listContactMessages", null);
exports.ContactController = ContactController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [mailer_service_1.MailerService,
        config_1.ConfigService,
        contact_data_service_1.ContactDataService])
], ContactController);
//# sourceMappingURL=contact.controller.js.map