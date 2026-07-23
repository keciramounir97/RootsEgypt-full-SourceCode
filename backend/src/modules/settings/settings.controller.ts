import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/settings.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { SITE_UPLOADS_DIR } from "../../common/utils/file.utils";
import * as crypto from "crypto";
import * as multer from "multer";
import * as path from "path";

const siteImageUploadOptions = {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, SITE_UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "");
      cb(null, `site-${crypto.randomBytes(16).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname || "").toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype || "");
    if (mimetype && extname) return cb(null, true);
    return cb(new Error("Only image files are allowed"), false);
  },
};

@Controller("admin/settings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "super_admin")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  async updateSettings(@Body() body: UpdateSettingsDto, @Request() req) {
    return this.settingsService.updateSettings(body, req.user.id);
  }

  @Get("payment")
  getPaymentSettings() {
    return this.settingsService.getPaymentSettings();
  }

  @Put("payment")
  updatePaymentSettings(@Body() body: any, @Request() req) {
    return this.settingsService.updatePaymentSettings(body, req.user.id);
  }
}

@Controller("payment-settings")
export class PublicPaymentSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getPaymentSettings() {
    return this.settingsService.getPaymentSettings();
  }
}

@Controller("site-images")
export class PublicSiteImagesController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSiteImages() {
    return this.settingsService.getSiteImages();
  }
}

@Controller("admin/site-images")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "super_admin")
export class AdminSiteImagesController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSiteImages() {
    return this.settingsService.getSiteImages();
  }

  @Get("hero")
  async getHeroImages() {
    return this.settingsService.getSiteImages();
  }

  @Put("hero")
  async updateHeroOptions(@Body() body: any, @Request() req) {
    return this.settingsService.updateHeroOptions(body, req.user.id);
  }

  @Post("hero")
  @UseInterceptors(FilesInterceptor("images", 12, siteImageUploadOptions))
  async addHeroImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    return this.settingsService.addHeroImages(files, req.user.id);
  }

  @Put("hero/reorder")
  async reorderHeroImages(@Body() body: any, @Request() req) {
    const ids = Array.isArray(body?.ids) ? body.ids.map(Number) : [];
    return this.settingsService.reorderHeroImages(ids, req.user.id);
  }

  @Patch("hero/:id")
  async updateHeroImage(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: any,
    @Request() req,
  ) {
    return this.settingsService.updateHeroImage(id, body, req.user.id);
  }

  @Delete("hero/:id")
  async deleteHeroImage(@Param("id", ParseIntPipe) id: number, @Request() req) {
    return this.settingsService.deleteHeroImage(id, req.user.id);
  }

  @Get("background")
  async getBackgroundImage() {
    return this.settingsService.getSiteImages();
  }

  @Put("background")
  async updateBackgroundOptions(@Body() body: any, @Request() req) {
    return this.settingsService.updateBackgroundOptions(body, req.user.id);
  }

  @Post("background")
  @UseInterceptors(FilesInterceptor("images", 12, siteImageUploadOptions))
  async addBackgroundImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    return this.settingsService.addBackgroundImages(files, req.user.id);
  }

  @Delete("background/:id")
  async deleteBackgroundImage(
    @Param("id", ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.settingsService.deleteBackgroundImage(id, req.user.id);
  }

  @Delete("background")
  async deleteBackgroundImages(@Request() req) {
    return this.settingsService.deleteBackgroundImages(req.user.id);
  }
}
