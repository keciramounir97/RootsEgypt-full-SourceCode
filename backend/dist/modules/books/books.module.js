"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksModule = void 0;
const common_1 = require("@nestjs/common");
const books_controller_1 = require("./books.controller");
const books_service_1 = require("./books.service");
const activity_module_1 = require("../activity/activity.module");
const platform_express_1 = require("@nestjs/platform-express");
const file_utils_1 = require("../../common/utils/file.utils");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
let BooksModule = class BooksModule {
};
exports.BooksModule = BooksModule;
exports.BooksModule = BooksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            activity_module_1.ActivityModule,
            platform_express_1.MulterModule.register({
                storage: multer.diskStorage({
                    destination: (req, file, cb) => {
                        cb(null, file_utils_1.BOOK_UPLOADS_DIR);
                    },
                    filename: (req, file, cb) => {
                        const ext = path.extname(file.originalname || '');
                        cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
                    },
                }),
                limits: { fileSize: 50 * 1024 * 1024 },
            }),
        ],
        controllers: [books_controller_1.BooksController],
        providers: [books_service_1.BooksService],
        exports: [books_service_1.BooksService],
    })
], BooksModule);
//# sourceMappingURL=books.module.js.map