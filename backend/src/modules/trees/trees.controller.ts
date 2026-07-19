
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
  Inject,
} from "@nestjs/common";
import { TreesService } from './trees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request as ExpressRequest } from "express";
import { Knex } from "knex";
import * as fs from 'fs';
import * as path from 'path';
import { CreateTreeDto, UpdateTreeDto } from './dto/tree.dto';
import { Person } from '../../models/Person';

const escapeGedcomValue = (value: unknown) =>
  String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const buildFallbackGedcom = (
  _tree: { id?: number; title?: string; description?: string },
  people: Array<{ id?: number; name?: string }> = [],
) => {
  const lines = [
    "0 HEAD",
    "1 SOUR RootsEgypt",
    "1 GEDC",
    "2 VERS 5.5.1",
    "1 CHAR UTF-8",
  ];

  const rows = people.map((person, index) => ({
    id: `@I${index + 1}@`,
    name: escapeGedcomValue(person.name) || `Person ${index + 1}`,
  }));

  for (const row of rows) {
    lines.push(`0 ${row.id} INDI`);
    lines.push(`1 NAME ${row.name}`);
  }

  lines.push("0 TRLR");
  return `${lines.join("\n")}\n`;
};

export const hasGedcomIndividuals = (content: unknown) =>
  /^0\s+@[^@]+@\s+INDI\b/im.test(String(content || ""));

export const hasGedcomXPeople = (content: unknown) => {
  const text = String(content || "").trim();
  return (
    /<[\w:-]*person\b/i.test(text) ||
    /"persons"\s*:\s*\[/i.test(text)
  );
};

export const getStoredGedcomText = (tree: any) => {
  const content = typeof tree?.gedcom_text === "string" ? tree.gedcom_text : "";
  return hasGedcomIndividuals(content) || hasGedcomXPeople(content)
    ? content
    : null;
};

@Controller()
export class TreesController {
  private readonly logger = new Logger(TreesController.name);
  constructor(
    private readonly treesService: TreesService,
    @Inject("KnexConnection") private readonly knex: Knex,
  ) {}

  private async sendGedcomResponse(tree: any, res: Response) {
    const filePath = tree.gedcom_path
      ? this.treesService.getGedcomPath(tree)
      : null;
    if (filePath && fs.existsSync(filePath)) {
      const ext = path.extname(filePath) || ".ged";
      const safeName =
        ((tree.title || "tree").replace(/[^\w.-]+/g, "_").trim() || "tree") + ext;
      res.download(filePath, safeName);
      return;
    }

    const storedGedcom = getStoredGedcomText(tree);
    if (storedGedcom) {
      res.type("text/plain; charset=utf-8").send(storedGedcom);
      return;
    }

    const people = await Person.query(this.knex)
      .where("tree_id", tree.id)
      .orderBy("name", "asc");
    if (people.length) {
      const fallback = buildFallbackGedcom(tree, people);
      res.type("text/plain; charset=utf-8").send(fallback);
      return;
    }

    res
      .status(404)
      .type("text/plain; charset=utf-8")
      .send(
        "GEDCOM file missing and no cached people were found. Re-upload or restore the original GEDCOM file for this tree.",
      );
  }

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
    await this.sendGedcomResponse(tree, res);
  }

  @Get("trees/:id")
  async getPublic(@Param("id", ParseIntPipe) id: number) {
    return this.treesService.getPublic(id);
  }

  @Get("my/trees")
  @UseGuards(JwtAuthGuard)
  async listMy(@Request() req: ExpressRequest) {
    return this.treesService.listByUser(req.user.id);
  }

  @Get("my/trees/:id")
  @UseGuards(JwtAuthGuard)
  async getMy(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const tree = await this.treesService.findOne(id);
    if (tree.user_id !== req.user.id) throw new ForbiddenException();
    return tree;
  }

  @Post("my/trees")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async createMy(
    @Body() body: CreateTreeDto,
    @Request() req: ExpressRequest,
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
    @Request() req: ExpressRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userRole = Number(
      req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0,
    );
    return this.treesService.update(id, body, req.user.id, userRole, file);
  }

  @Post("my/trees/:id/save")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async saveMy(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTreeDto,
    @Request() req: ExpressRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userRole = Number(
      req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0,
    );
    return this.treesService.update(id, body, req.user.id, userRole, file);
  }

  @Delete("my/trees/:id")
  @UseGuards(JwtAuthGuard)
  async deleteMy(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const userRole = Number(
      req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0,
    );
    return this.treesService.delete(id, req.user.id, userRole);
  }

  @Get("my/trees/:id/gedcom")
  @UseGuards(JwtAuthGuard)
  async downloadMyGedcom(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    const tree = await this.treesService.findOne(id);
    if (tree.user_id !== req.user.id) throw new ForbiddenException();

    await this.sendGedcomResponse(tree, res);
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
    await this.sendGedcomResponse(tree, res);
  }

  @Post("admin/trees")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @UseInterceptors(FileInterceptor("file"))
  async createAdmin(
    @Body() body: CreateTreeDto,
    @Request() req: ExpressRequest,
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
    @Request() req: ExpressRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userRole = Number(
      req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0,
    );
    return this.treesService.update(id, body, req.user.id, userRole, file);
  }

  @Put("admin/trees/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @UseInterceptors(FileInterceptor("file"))
  async updateAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTreeDto,
    @Request() req: ExpressRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userRole = Number(
      req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0,
    );
    return this.treesService.update(id, body, req.user.id, userRole, file);
  }

  @Delete("admin/trees/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  async deleteAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const userRole = Number(
      req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0,
    );
    return this.treesService.delete(id, req.user.id, userRole);
  }
}
