import {
    Controller, Get, Post, Put, Patch, Delete, Body, Param,
    UseGuards, Request, ParseIntPipe, Logger,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class ArticlesController {
    private readonly logger = new Logger(ArticlesController.name);
    constructor(private readonly articlesService: ArticlesService) {}

    @Get('articles')
    async listPublic() {
        try {
            return await this.articlesService.listPublic();
        } catch (error) {
            this.logger.error(`listPublic failed: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }

    @Get('articles/:id')
    async getPublic(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.getPublic(id);
    }

    @Get('my/articles')
    @UseGuards(JwtAuthGuard)
    async listMy(@Request() req) {
        return this.articlesService.listByUser(req.user.id);
    }

    @Post('my/articles')
    @UseGuards(JwtAuthGuard)
    async createMy(@Body() body: any, @Request() req) {
        return this.articlesService.create(body, req.user.id);
    }

    @Put('my/articles/:id')
    @Patch('my/articles/:id')
    @UseGuards(JwtAuthGuard)
    async updateMy(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Request() req) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.articlesService.update(id, body, req.user.id, userRole);
    }

    @Delete('my/articles/:id')
    @UseGuards(JwtAuthGuard)
    async deleteMy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.articlesService.delete(id, req.user.id, userRole);
    }

    @Post('my/articles/:id/like')
    @UseGuards(JwtAuthGuard)
    async like(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.articlesService.like(id, req.user.id);
    }

    @Get('admin/articles')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async listAdmin() {
        return this.articlesService.listAdmin();
    }

    @Post('admin/articles')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async createAdmin(@Body() body: any, @Request() req) {
        return this.articlesService.create(body, req.user.id);
    }

    @Put('admin/articles/:id')
    @Patch('admin/articles/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Request() req) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.articlesService.update(id, body, req.user.id, userRole);
    }

    @Delete('admin/articles/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async deleteAdmin(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userRole = req.user?.role_id ?? req.user?.roleId ?? req.user?.role;
        return this.articlesService.delete(id, req.user.id, userRole);
    }
}
