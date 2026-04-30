"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./db/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const books_module_1 = require("./modules/books/books.module");
const trees_module_1 = require("./modules/trees/trees.module");
const gallery_module_1 = require("./modules/gallery/gallery.module");
const contact_module_1 = require("./modules/contact/contact.module");
const activity_module_1 = require("./modules/activity/activity.module");
const stats_module_1 = require("./modules/stats/stats.module");
const search_module_1 = require("./modules/search/search.module");
const health_module_1 = require("./modules/health/health.module");
const approvals_module_1 = require("./modules/approvals/approvals.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                ignoreEnvFile: true,
            }),
            database_module_1.DatabaseModule,
            activity_module_1.ActivityModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            books_module_1.BooksModule,
            trees_module_1.TreesModule,
            gallery_module_1.GalleryModule,
            contact_module_1.ContactModule,
            stats_module_1.StatsModule,
            search_module_1.SearchModule,
            health_module_1.HealthModule,
            approvals_module_1.ApprovalsModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map