import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SuggestionsService } from './suggestions.service';
import { CreateSuggestionDto } from './dto/suggestion.dto';

@Controller()
export class SuggestionsController {
    constructor(private readonly suggestionsService: SuggestionsService) { }

    @Post('suggestions')
    async create(@Body() body: CreateSuggestionDto) {
        return this.suggestionsService.create(body);
    }

    @Get('suggestions')
    async listPublic() {
        return this.suggestionsService.listPublic();
    }

    @Get('admin/suggestions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async listAdmin() {
        return this.suggestionsService.listAdmin();
    }

    @Patch('admin/suggestions/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async patchStatus(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Request() req) {
        const status = String(body?.status || '').toLowerCase();
        if (status === 'approved') return this.suggestionsService.updateStatus(id, 'approved', req.user.id);
        return this.suggestionsService.updateStatus(id, 'rejected', req.user.id);
    }

    @Put('admin/suggestions/:id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async approve(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.suggestionsService.updateStatus(id, 'approved', req.user.id);
    }

    @Post('admin/suggestions/:id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async approvePost(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.suggestionsService.updateStatus(id, 'approved', req.user.id);
    }

    @Post('suggestions/:id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async approveLegacy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.suggestionsService.updateStatus(id, 'approved', req.user.id);
    }

    @Put('admin/suggestions/:id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async reject(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.suggestionsService.updateStatus(id, 'rejected', req.user.id);
    }

    @Post('admin/suggestions/:id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async rejectPost(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.suggestionsService.updateStatus(id, 'rejected', req.user.id);
    }

    @Post('suggestions/:id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async rejectLegacy(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.suggestionsService.updateStatus(id, 'rejected', req.user.id);
    }
}
