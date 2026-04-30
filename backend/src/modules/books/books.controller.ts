
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
  UploadedFiles,
  Res,
  NotFoundException,
  ForbiddenException,
  ParseIntPipe,
  Logger,
} from "@nestjs/common";
import { BooksService } from './books.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response, Request as ExpressRequest } from "express";
import * as fs from 'fs';
import * as path from 'path';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';

@Controller()
export class BooksController {
  private readonly logger = new Logger(BooksController.name);
  constructor(private readonly booksService: BooksService) {}

  // Public Routes
  @Get("books")
  async listPublic() {
    try {
      return await this.booksService.listPublic();
    } catch (error) {
      this.logger.error(
        `listPublic failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      return [];
    }
  }

  @Get("books/:id")
  async getPublic(@Param("id", ParseIntPipe) id: number) {
    return this.booksService.getPublic(id);
  }

  @Get("books/:id/download")
  async downloadPublic(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const book = await this.booksService.getPublic(id);
    if (!book.is_public) throw new ForbiddenException("Not public");

    const filePath = this.booksService.getFilePath(book);
    if (!filePath || !fs.existsSync(filePath))
      throw new NotFoundException("File not found");

    await this.booksService.incrementDownload(id);
    res.download(filePath, path.basename(filePath));
  }

  // My Routes
  @Get("my/books")
  @UseGuards(JwtAuthGuard)
  async listMy(@Request() req: ExpressRequest) {
    return this.booksService.listByUser(req.user.id);
  }

  @Get("my/books/:id")
  @UseGuards(JwtAuthGuard)
  async getMy(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const book = await this.booksService.findOne(id);
    if (book.uploaded_by !== req.user.id) throw new ForbiddenException();
    return book;
  }

  @Post("my/books")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "file", maxCount: 1 },
      { name: "cover", maxCount: 1 },
    ]),
  )
  async createMy(
    @Body() body: CreateBookDto,
    @Request() req: ExpressRequest,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    return this.booksService.create(body, req.user.id, files);
  }

  @Put("my/books/:id")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "file", maxCount: 1 },
      { name: "cover", maxCount: 1 },
    ]),
  )
  async updateMy(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateBookDto,
    @Request() req: ExpressRequest,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    const userRole = Number(
      req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0,
    );
    return this.booksService.update(id, body, req.user.id, userRole, files);
  }

  @Delete("my/books/:id")
  @UseGuards(JwtAuthGuard)
  async deleteMy(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const userRole = Number(
      req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0,
    );
    return this.booksService.delete(id, req.user.id, userRole);
  }

  @Get("my/books/:id/download")
  @UseGuards(JwtAuthGuard)
  async downloadMy(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    const book = await this.booksService.findOne(id);
    if (book.uploaded_by !== req.user.id) throw new ForbiddenException();

    const filePath = this.booksService.getFilePath(book);
    if (!filePath || !fs.existsSync(filePath))
      throw new NotFoundException("File not found");

    await this.booksService.incrementDownload(id);
    res.download(filePath, path.basename(filePath));
  }

  // Admin Routes
  @Get("admin/books")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  async listAdmin() {
    return this.booksService.listAdmin();
  }

  @Get("admin/books/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  async getAdmin(@Param("id", ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Post("admin/books")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "file", maxCount: 1 },
      { name: "cover", maxCount: 1 },
    ]),
  )
  async createAdmin(
    @Body() body: CreateBookDto,
    @Request() req: ExpressRequest,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    return this.booksService.create(body, req.user.id, files);
  }

  @Put("admin/books/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "file", maxCount: 1 },
      { name: "cover", maxCount: 1 },
    ]),
  )
  async updateAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateBookDto,
    @Request() req: ExpressRequest,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    const userRole = Number(
      req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0,
    );
    return this.booksService.update(id, body, req.user.id, userRole, files);
  }

  @Delete("admin/books/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  async deleteAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const userRole = Number(
      req.user?.role_id ?? req.user?.roleId ?? req.user?.role ?? 0,
    );
    return this.booksService.delete(id, req.user.id, userRole);
  }
}
