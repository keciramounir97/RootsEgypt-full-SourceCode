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
exports.ContactDataService = void 0;
const common_1 = require("@nestjs/common");
const knex_1 = require("knex");
let ContactDataService = class ContactDataService {
    constructor(knex) {
        this.knex = knex;
    }
    async saveContactMessage(payload) {
        const [id] = await this.knex("contact_messages").insert({
            name: payload.name,
            email: payload.email,
            message: payload.message,
            created_at: this.knex.fn.now(),
        });
        return id;
    }
    async listContactMessages() {
        return this.knex("contact_messages")
            .select("*")
            .orderBy("created_at", "desc");
    }
    async upsertNewsletterSubscriber(email) {
        const existing = await this.knex("newsletter_subscribers")
            .where("email", email)
            .first();
        if (existing)
            return existing.id;
        const [id] = await this.knex("newsletter_subscribers").insert({
            email,
            created_at: this.knex.fn.now(),
        });
        return id;
    }
    async listNewsletterSubscribers() {
        return this.knex("newsletter_subscribers")
            .select("*")
            .orderBy("created_at", "desc");
    }
};
exports.ContactDataService = ContactDataService;
exports.ContactDataService = ContactDataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("KnexConnection")),
    __metadata("design:paramtypes", [Function])
], ContactDataService);
//# sourceMappingURL=contact-data.service.js.map