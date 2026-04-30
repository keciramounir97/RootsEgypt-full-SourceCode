"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const objection_1 = require("objection");
const Knex = require("knex");
function readConnectionFromDatabaseUrl(databaseUrl) {
    if (!databaseUrl)
        return {};
    try {
        const parsed = new URL(databaseUrl);
        return {
            host: parsed.hostname,
            port: Number(parsed.port || 3306),
            user: decodeURIComponent(parsed.username || ""),
            password: decodeURIComponent(parsed.password || ""),
            database: (parsed.pathname || "").replace(/^\//, ""),
        };
    }
    catch (_a) {
        return {};
    }
}
function pickFirstDefined(...values) {
    for (const value of values) {
        if (value === undefined || value === null)
            continue;
        const normalized = String(value).trim();
        if (normalized)
            return normalized;
    }
    return undefined;
}
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: "KnexConnection",
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    const dbUrl = configService.get("DATABASE_URL");
                    const fromUrl = readConnectionFromDatabaseUrl(dbUrl);
                    const host = pickFirstDefined(configService.get("DB_HOST"), configService.get("MYSQL_HOST"), configService.get("MYSQLHOST"), process.env.DB_HOST, process.env.MYSQL_HOST, process.env.MYSQLHOST, fromUrl.host, "rootsegypt_database-egypt");
                    const port = Number(pickFirstDefined(configService.get("DB_PORT"), configService.get("MYSQL_PORT"), process.env.DB_PORT, process.env.MYSQL_PORT, fromUrl.port, 3306));
                    const user = pickFirstDefined(configService.get("DB_USER"), configService.get("MYSQL_USER"), configService.get("MYSQLUSER"), process.env.DB_USER, process.env.MYSQL_USER, process.env.MYSQLUSER, fromUrl.user, "adminEgypt");
                    const password = pickFirstDefined(configService.get("DB_PASSWORD"), configService.get("MYSQL_PASSWORD"), configService.get("MYSQLPASSWORD"), process.env.DB_PASSWORD, process.env.MYSQL_PASSWORD, process.env.MYSQLPASSWORD, fromUrl.password, "Egypt20252026$$$");
                    const database = pickFirstDefined(configService.get("DB_NAME"), configService.get("DB_DATABASE"), configService.get("MYSQL_DATABASE"), configService.get("MYSQLDATABASE"), process.env.DB_NAME, process.env.DB_DATABASE, process.env.MYSQL_DATABASE, process.env.MYSQLDATABASE, fromUrl.database, "rootsEgypt");
                    if (!host || !user || !database) {
                        console.warn("⚠️ Incomplete DB env detected, using fallback defaults for EasyPanel startup.");
                    }
                    console.log(`🟡 DB CONFIG host=${host} port=${port} database=${database} user=${user}`);
                    const knexConfig = {
                        client: "mysql2",
                        connection: {
                            host,
                            port,
                            user,
                            password,
                            database,
                            charset: "utf8mb4",
                            typeCast(field, next) {
                                if (field.type === "LONGLONG") {
                                    const val = field.string();
                                    return val === null ? null : Number(val);
                                }
                                if (field.type === "TINY" && field.length === 1) {
                                    const val = field.string();
                                    return val === null ? null : val === "1";
                                }
                                return next();
                            },
                        },
                        pool: {
                            min: 0,
                            max: 5,
                            acquireTimeoutMillis: 30000,
                            createTimeoutMillis: 30000,
                            destroyTimeoutMillis: 5000,
                            idleTimeoutMillis: 30000,
                        },
                        debug: configService.get("NODE_ENV") === "development",
                    };
                    try {
                        const knex = Knex.default(knexConfig);
                        objection_1.Model.knex(knex);
                        await knex.raw("SELECT 1");
                        console.log("🟢 DB HANDSHAKE OK");
                        return knex;
                    }
                    catch (err) {
                        const msg = (err === null || err === void 0 ? void 0 : err.sqlMessage) ||
                            (err === null || err === void 0 ? void 0 : err.message) ||
                            (err === null || err === void 0 ? void 0 : err.code) ||
                            JSON.stringify(err || {});
                        console.error(`🔴 DB HANDSHAKE FAILED: ${msg}`);
                        throw err;
                    }
                },
            },
        ],
        exports: ["KnexConnection"],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map