"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const documents_controller_1 = require("./documents.controller");
const documents_service_1 = require("./documents.service");
const activity_module_1 = require("../activity/activity.module");
const platform_express_1 = require("@nestjs/platform-express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
if (!fs.existsSync(documents_service_1.DOCUMENT_UPLOADS_DIR)) {
    fs.mkdirSync(documents_service_1.DOCUMENT_UPLOADS_DIR, { recursive: true });
}
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            activity_module_1.ActivityModule,
            platform_express_1.MulterModule.register({
                storage: multer.diskStorage({
                    destination: (_req, _file, cb) => cb(null, documents_service_1.DOCUMENT_UPLOADS_DIR),
                    filename: (_req, file, cb) => {
                        const ext = path.extname(file.originalname || '');
                        cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
                    },
                }),
                limits: { fileSize: 50 * 1024 * 1024 },
            }),
        ],
        controllers: [documents_controller_1.DocumentsController],
        providers: [documents_service_1.DocumentsService],
        exports: [documents_service_1.DocumentsService],
    })
], DocumentsModule);
//# sourceMappingURL=documents.module.js.map