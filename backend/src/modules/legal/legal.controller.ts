import { Body, Controller, Get, Param, Put, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LegalService } from './legal.service';
import { UpdateLegalDocumentDto } from './dto/legal.dto';

@Controller('legal')
export class PublicLegalController {
    constructor(private readonly legalService: LegalService) { }

    @Get(':slug')
    async getDocument(@Param('slug') slug: string, @Query('locale') locale?: string) {
        return this.legalService.getPublicDocument(slug, locale);
    }
}

@Controller('admin/legal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AdminLegalController {
    constructor(private readonly legalService: LegalService) { }

    @Get()
    async listDocuments() {
        return this.legalService.listDocuments();
    }

    @Get(':slug')
    async getDocument(@Param('slug') slug: string, @Query('locale') locale?: string) {
        return this.legalService.getAdminDocument(slug, locale);
    }

    @Put(':slug')
    async updateDocument(
        @Param('slug') slug: string,
        @Body() body: UpdateLegalDocumentDto,
        @Request() req,
    ) {
        return this.legalService.updateDocument(slug, body, req.user.id);
    }
}
