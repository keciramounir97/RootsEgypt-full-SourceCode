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
const { DB_ENV_HELP, buildDbConfigErrorMessage, resolveDbConfig } = require("../../db-config");
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
                    const resolved = resolveDbConfig((key) => configService.get(key), process.env);
                    console.log(`INFO DB CONFIG bootstrap tried=${resolved.bootstrapFilesTried.join(",")} loaded=${resolved.bootstrapFilesLoaded.join(",") || "none"} resolutionSource=${resolved.resolutionSource} help="${DB_ENV_HELP}"`);
                    console.log(`INFO DB ENV presence ${JSON.stringify(resolved.envPresence)}`);
                    if (resolved.missingFields.length > 0) {
                        const errorMessage = buildDbConfigErrorMessage(resolved.missingFields);
                        console.error(`ERROR DB CONFIG ${errorMessage}`);
                        throw new Error(errorMessage);
                    }
                    console.log(`INFO DB CONFIG resolved source=${resolved.resolutionSource} host=${resolved.connection.host} port=${resolved.connection.port} database=${resolved.connection.database} user=${resolved.connection.user}`);
                    const knexConfig = {
                        client: "mysql2",
                        connection: Object.assign(Object.assign({}, resolved.connection), { typeCast(field, next) {
                                if (field.type === "LONGLONG") {
                                    const val = field.string();
                                    return val === null ? null : Number(val);
                                }
                                if (field.type === "TINY" && field.length === 1) {
                                    const val = field.string();
                                    return val === null ? null : val === "1";
                                }
                                return next();
                            } }),
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
                        console.log("INFO DB HANDSHAKE OK");
                        return knex;
                    }
                    catch (err) {
                        const msg = (err === null || err === void 0 ? void 0 : err.sqlMessage) ||
                            (err === null || err === void 0 ? void 0 : err.message) ||
                            (err === null || err === void 0 ? void 0 : err.code) ||
                            JSON.stringify(err || {});
                        console.error(`ERROR DB HANDSHAKE FAILED: ${msg}`);
                        throw err;
                    }
                },
            },
        ],
        exports: ["KnexConnection"],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map