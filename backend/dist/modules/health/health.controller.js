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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const knex_1 = require("knex");
const User_1 = require("../../models/User");
let HealthController = class HealthController {
    constructor(knex) {
        this.knex = knex;
    }
    live() {
        return {
            status: "alive",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || "1.0.0",
        };
    }
    async ready() {
        try {
            await this.knex.raw("SELECT 1");
            return {
                ok: true,
                status: "ready",
                timestamp: new Date().toISOString(),
                database: "connected",
                uptime: process.uptime(),
                version: process.env.npm_package_version || "1.0.0",
            };
        }
        catch (error) {
            throw new common_1.ServiceUnavailableException({
                ok: false,
                status: "not_ready",
                timestamp: new Date().toISOString(),
                database: "disconnected",
                error: (error === null || error === void 0 ? void 0 : error.message) || "database unavailable",
                uptime: process.uptime(),
            });
        }
    }
    async dbHealth() {
        try {
            await this.knex.raw("SELECT 1");
            return {
                ok: true,
                database: "connected",
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.ServiceUnavailableException({
                ok: false,
                database: "disconnected",
                error: (error === null || error === void 0 ? void 0 : error.message) || "database unavailable",
                timestamp: new Date().toISOString(),
            });
        }
    }
    async dbDiag() {
        var _a;
        if (process.env.NODE_ENV === "production") {
            throw new common_1.ForbiddenException("Diagnostic endpoint not available in production");
        }
        const result = { timestamp: new Date().toISOString() };
        try {
            const [rows] = await this.knex.raw("SELECT COUNT(*) as cnt FROM users");
            result.rawKnex = { ok: true, userCount: (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.cnt };
        }
        catch (e) {
            result.rawKnex = { ok: false, error: e === null || e === void 0 ? void 0 : e.message };
        }
        try {
            const count = (await User_1.User.query(this.knex)
                .count("id as cnt")
                .first());
            result.objectionQuery = { ok: true, userCount: count === null || count === void 0 ? void 0 : count.cnt };
        }
        catch (e) {
            result.objectionQuery = { ok: false, error: e === null || e === void 0 ? void 0 : e.message };
        }
        try {
            const checks = {
                users_admin_privileges: await this.knex.schema.hasColumn("users", "admin_privileges"),
                family_trees_data_format: await this.knex.schema.hasColumn("family_trees", "data_format"),
                contact_messages: await this.knex.schema.hasTable("contact_messages"),
                newsletter_subscribers: await this.knex.schema.hasTable("newsletter_subscribers"),
                password_reset_requests: await this.knex.schema.hasTable("password_reset_requests"),
                account_deletion_requests: await this.knex.schema.hasTable("account_deletion_requests"),
            };
            result.schemaChecks = checks;
        }
        catch (e) {
            result.schemaChecks = { error: e === null || e === void 0 ? void 0 : e.message };
        }
        return result;
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)("health/live"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "live", null);
__decorate([
    (0, common_1.Get)("health"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
__decorate([
    (0, common_1.Get)("db-health"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "dbHealth", null);
__decorate([
    (0, common_1.Get)("health/db-diag"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "dbDiag", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_2.Inject)("KnexConnection")),
    __metadata("design:paramtypes", [Function])
], HealthController);
//# sourceMappingURL=health.controller.js.map