"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryModule = void 0;
const common_1 = require("@nestjs/common");
const gallery_controller_1 = require("./gallery.controller");
const gallery_service_1 = require("./gallery.service");
const activity_module_1 = require("../activity/activity.module");
const platform_express_1 = require("@nestjs/platform-express");
const file_utils_1 = require("../../common/utils/file.utils");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
let GalleryModule = class GalleryModule {
};
exports.GalleryModule = GalleryModule;
exports.GalleryModule = GalleryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            activity_module_1.ActivityModule,
            platform_express_1.MulterModule.register({
                storage: multer.diskStorage({
                    destination: (req, file, cb) => {
                        cb(null, file_utils_1.GALLERY_UPLOADS_DIR);
                    },
                    filename: (req, file, cb) => {
                        const ext = path.extname(file.originalname || '');
                        cb(null, `gallery-${crypto.randomBytes(16).toString('hex')}${ext}`);
                    },
                }),
                limits: { fileSize: 10 * 1024 * 1024 },
                fileFilter: (req, file, cb) => {
                    const allowedTypes = /jpeg|jpg|png|gif|webp/;
                    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
                    const mimetype = allowedTypes.test(file.mimetype);
                    if (mimetype && extname) {
                        return cb(null, true);
                    }
                    cb(new Error('Only image files are allowed!'), false);
                }
            }),
        ],
        controllers: [gallery_controller_1.GalleryController],
        providers: [gallery_service_1.GalleryService],
        exports: [gallery_service_1.GalleryService],
    })
], GalleryModule);
//# sourceMappingURL=gallery.module.js.map