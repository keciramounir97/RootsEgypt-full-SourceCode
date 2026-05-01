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
    apiInfo() {
        return {
            app: "RootsEgypt API",
            ok: true,
            status: "healthy",
            color: "green",
            health: "/api/health",
            live: "/api/health/live",
            db: "/api/db-health",
            routes: "/api/routes",
            message: "API routes are available under /api. If this appears for /api/errors/not-found, check reverse proxy path forwarding.",
        };
    }
    root() {
        return this.apiInfo();
    }
    routes() {
        return {
            ok: true,
            routes: {
                health: ["/api", "/api/health", "/api/health/live", "/health/live"],
                auth: [
                    "/api/login",
                    "/api/signup",
                    "/api/me",
                    "/api/refresh",
                    "/api/logout",
                    "/api/reset",
                    "/api/reset/verify",
                    "/api/reset/token",
                    "/api/auth/login",
                    "/api/auth/signup",
                    "/api/auth/me",
                    "/api/auth/refresh",
                    "/api/auth/logout",
                    "/api/auth/reset",
                    "/api/auth/reset/verify",
                    "/api/auth/reset/token",
                ],
                public: [
                    "/api/trees",
                    "/api/books",
                    "/api/gallery",
                    "/api/search",
                    "/api/search/suggest",
                    "/api/contact",
                    "/api/newsletter/subscribe",
                ],
                user: ["/api/my/trees", "/api/my/books", "/api/my/gallery"],
                admin: [
                    "/api/admin/users",
                    "/api/admin/admins",
                    "/api/admin/trees",
                    "/api/admin/books",
                    "/api/admin/gallery",
                    "/api/admin/stats",
                    "/api/admin/contact/messages",
                    "/api/admin/newsletter/subscribers",
                    "/api/admin/approvals/stats",
                ],
            },
        };
    }
    live() {
        return {
            ok: true,
            status: "healthy",
            color: "green",
            database: "not_checked",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || "1.0.0",
        };
    }
    async ready() {
        let database = "not_checked";
        let databaseError;
        try {
            await this.knex.raw("SELECT 1");
            database = "connected";
        }
        catch (error) {
            database = "disconnected";
            databaseError = (error === null || error === void 0 ? void 0 : error.message) || "database unavailable";
        }
        return {
            ok: true,
            status: "healthy",
            color: "green",
            timestamp: new Date().toISOString(),
            database,
            databaseError,
            dbHealth: "/api/db-health",
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || "1.0.0",
        };
    }
    async dbHealth() {
        try {
            await this.knex.raw("SELECT 1");
            return {
                ok: true,
                status: "healthy",
                color: "green",
                database: "connected",
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                ok: false,
                status: "unhealthy",
                color: "red",
                database: "disconnected",
                error: (error === null || error === void 0 ? void 0 : error.message) || "database unavailable",
                timestamp: new Date().toISOString(),
            };
        }
    }
    proxyFallbackPreflight() {
        return undefined;
    }
    proxyFallback(req) {
        return Object.assign(Object.assign({}, this.apiInfo()), { ok: false, status: "proxy_rewrite_not_found", method: req.method, path: req.originalUrl || req.url, message: "The backend received /api/errors/not-found. Configure the reverse proxy to forward the original API path, or pass X-Original-Uri/X-Rewrite-Url/X-Forwarded-Uri so the backend can restore it." });
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
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "root", null);
__decorate([
    (0, common_1.Get)("routes"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "routes", null);
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
    (0, common_1.Options)("errors/not-found"),
    (0, common_1.HttpCode)(204),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "proxyFallbackPreflight", null);
__decorate([
    (0, common_1.All)("errors/not-found"),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "proxyFallback", null);
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