
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  ForbiddenException,
  ParseIntPipe,
  Logger,
} from "@nestjs/common";
import { TreesService } from './trees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { CreateTreeDto, UpdateTreeDto } from './dto/tree.dto';

const EMPTY_GEDCOM = '0 HEAD\n1 GEDC\n2 VERS 5.5.1\n0 TRLR\n';

@Controller()
export class TreesController {
  private readonly logger = new Logger(TreesController.name);
  constructor(private readonly treesService: TreesService) {}

  @Get("trees")
  async listPublic() {
    try {
      return await this.treesService.listPublic();
    } catch (error) {
      this.logger.error(
        `listPublic failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      return [];
    }
  }

  @Get("trees/:id/gedcom")
  async downloadPublicGedcom(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const tree = await this.treesService.getPublic(id);
    const filePath = tree.gedcom_path
      ? this.treesService.getGedcomPath(tree)
      : null;
    if (!filePath || !fs.existsSync(filePath)) {
      res.type("text/plain; charset=utf-8").send(EMPTY_GEDCOM);
      return;
    }
    const ext = path.extname(filePath) || ".ged";
    const safeName =
      ((tree.title || "tree").replace(/[^\w.-]+/g, "_").trim() || "tree") + ext;
    res.download(filePath, safeName);
  }

  @Get("trees/:id")
  async getPublic(@Param("id", ParseIntPipe) id: number) {
    return this.treesService.getPublic(id);
  }

  @Get("my/trees")
  @UseGuards(JwtAuthGuard)
  async listMy(@Request() req) {
    return this.treesService.listByUser(req.user.id);
  }

  @Get("my/trees/:id")
  @UseGuards(JwtAuthGuard)
  async getMy(@Param("id", ParseIntPipe) id: number, @Request() req) {
    const tree = await this.treesService.findOne(id);
    if (tree.user_id !== req.user.id) throw new ForbiddenException();
    return tree;
  }

  @Post("my/trees")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async createMy(
    @Body() body: CreateTreeDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.treesService.create(body, req.user.id, file);
  }

  @Put("my/trees/:id")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async updateMy(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTreeDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
    return this.treesService.update(id, body, req.user.id, userRole, file);
  }

  @Post("my/trees/:id/save")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async saveMy(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTreeDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
    return this.treesService.update(id, body, req.user.id, userRole, file);
  }

  @Delete("my/trees/:id")
  @UseGuards(JwtAuthGuard)
  async deleteMy(@Param("id", ParseIntPipe) id: number, @Request() req) {
    const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
    return this.treesService.delete(id, req.user.id, userRole);
  }

  @Get("my/trees/:id/gedcom")
  @UseGuards(JwtAuthGuard)
  async downloadMyGedcom(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
    @Request() req,
  ) {
    const tree = await this.treesService.findOne(id);
    if (tree.user_id !== req.user.id) throw new ForbiddenException();

    const filePath = tree.gedcom_path
      ? this.treesService.getGedcomPath(tree)
      : null;
    if (!filePath || !fs.existsSync(filePath)) {
      res.type("text/plain; charset=utf-8").send(EMPTY_GEDCOM);
      return;
    }
    const ext = path.extname(filePath) || ".ged";
    const safeName =
      ((tree.title || "tree").replace(/[^\w.-]+/g, "_").trim() || "tree") + ext;
    res.download(filePath, safeName);
  }

  // Admin Routes
  @Get("admin/trees")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  async listAdmin() {
    return this.treesService.listAdmin();
  }

  @Get("admin/trees/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  async getAdmin(@Param("id", ParseIntPipe) id: number) {
    return this.treesService.findOne(id);
  }

  @Get("admin/trees/:id/gedcom")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  async downloadAdminGedcom(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const tree = await this.treesService.findOne(id);
    const filePath = tree.gedcom_path
      ? this.treesService.getGedcomPath(tree)
      : null;
    if (!filePath || !fs.existsSync(filePath)) {
      res.type("text/plain; charset=utf-8").send(EMPTY_GEDCOM);
      return;
    }
    const ext = path.extname(filePath) || ".ged";
    const safeName =
      ((tree.title || "tree").replace(/[^\w.-]+/g, "_").trim() || "tree") + ext;
    res.download(filePath, safeName);
  }

  @Post("admin/trees")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @UseInterceptors(FileInterceptor("file"))
  async createAdmin(
    @Body() body: CreateTreeDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.treesService.create(body, req.user.id, file);
  }

  @Post("admin/trees/:id/save")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @UseInterceptors(FileInterceptor("file"))
  async saveAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTreeDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
    return this.treesService.update(id, body, req.user.id, userRole, file);
  }

  @Put("admin/trees/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @UseInterceptors(FileInterceptor("file"))
  async updateAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTreeDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
    return this.treesService.update(id, body, req.user.id, userRole, file);
  }

  @Delete("admin/trees/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  async deleteAdmin(@Param("id", ParseIntPipe) id: number, @Request() req) {
    const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
    return this.treesService.delete(id, req.user.id, userRole);
  }
}
