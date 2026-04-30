
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, ForbiddenException, ParseIntPipe, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Logger } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateGalleryDto, UpdateGalleryDto } from './dto/gallery.dto';

@Controller()
export class GalleryController {
    private readonly logger = new Logger(GalleryController.name);
    constructor(private readonly galleryService: GalleryService) { }

    @Get('gallery')
    async listPublic() {
        try {
            return await this.galleryService.listPublic();
        } catch (error) {
            // Keep public gallery endpoint resilient for frontend rendering.
            this.logger.warn(`Failed to load public gallery, returning empty list: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }

    @Get('gallery/:id')
    async getPublic(@Param('id', ParseIntPipe) id: number) {
        return this.galleryService.getPublic(id);
    }

    @Get('my/gallery')
    @UseGuards(JwtAuthGuard)
    async listMy(@Request() req) {
        return this.galleryService.listByUser(req.user.id);
    }

    @Get('my/gallery/:id')
    @UseGuards(JwtAuthGuard)
    async getMy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const item = await this.galleryService.findOne(id);
        if (item.uploaded_by !== req.user.id) throw new ForbiddenException();
        return item; // Interceptor wraps this
    }

    @Post('my/gallery')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    async createMy(
        @Body() body: CreateGalleryDto,
        @Request() req,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
                ],
                fileIsRequired: true
            })
        ) file: Express.Multer.File
    ) {
        const item = await this.galleryService.create(body, req.user.id, file);
        return item;
    }

    @Post('my/gallery/:id/save')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    async saveMy(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateGalleryDto,
        @Request() req,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
                ],
                fileIsRequired: false
            })
        ) file?: Express.Multer.File
    ) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.galleryService.update(id, body, req.user.id, userRole, file);
    }

    @Put('my/gallery/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    async updateMy(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateGalleryDto,
        @Request() req,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
                ],
                fileIsRequired: false
            })
        ) file?: Express.Multer.File
    ) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.galleryService.update(id, body, req.user.id, userRole, file);
    }

    @Delete('my/gallery/:id')
    @UseGuards(JwtAuthGuard)
    async deleteMy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        await this.galleryService.delete(id, req.user.id, userRole);
        return { message: "Deleted successfully" };
    }

    // Admin Routes
    @Get('admin/gallery')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async listAdmin() {
        return this.galleryService.listAdmin();
    }

    @Get('admin/gallery/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async getAdmin(@Param('id', ParseIntPipe) id: number) {
        return this.galleryService.findOne(id);
    }

    @Post('admin/gallery')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    @UseInterceptors(FileInterceptor('image'))
    async createAdmin(
        @Body() body: CreateGalleryDto,
        @Request() req,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
                ],
                fileIsRequired: true
            })
        ) file: Express.Multer.File
    ) {
        return this.galleryService.create(body, req.user.id, file);
    }

    @Post('admin/gallery/:id/save')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    @UseInterceptors(FileInterceptor('image'))
    async saveAdmin(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateGalleryDto,
        @Request() req,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
                ],
                fileIsRequired: false
            })
        ) file?: Express.Multer.File
    ) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.galleryService.update(id, body, req.user.id, userRole, file);
    }

    @Put('admin/gallery/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    @UseInterceptors(FileInterceptor('image'))
    async updateAdmin(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateGalleryDto,
        @Request() req,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^image\/(jpe?g|png|webp|gif)$/i, skipMagicNumbersValidation: true }),
                ],
                fileIsRequired: false
            })
        ) file?: Express.Multer.File
    ) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.galleryService.update(id, body, req.user.id, userRole, file);
    }

    @Delete('admin/gallery/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async deleteAdmin(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        await this.galleryService.delete(id, req.user.id, userRole);
        return { message: "Deleted successfully" };
    }
}
