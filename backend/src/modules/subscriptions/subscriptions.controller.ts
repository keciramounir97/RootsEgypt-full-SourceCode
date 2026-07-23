import {
    BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch,
    Post, Put, Query, Request, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UPLOADS_DIR } from '../../common/utils/file.utils';
import { SubscriptionsService } from './subscriptions.service';
import { CreateTierFeatureDto, SetTierFeatureDto, UpdateTierContentDto } from './dto/subscription.dto';

export const SUBSCRIPTION_PROOF_UPLOADS_DIR = path.join(UPLOADS_DIR, 'subscription-proofs');

const proofUploadOptions = {
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            fs.mkdirSync(SUBSCRIPTION_PROOF_UPLOADS_DIR, { recursive: true });
            cb(null, SUBSCRIPTION_PROOF_UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || '');
            cb(null, `proof-${crypto.randomBytes(16).toString('hex')}${ext}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname || '').toLowerCase());
        const mimetype = /^(image\/|application\/pdf)/.test(file.mimetype || '');
        if (mimetype && extname) return cb(null, true);
        return cb(new Error('Only image or PDF files are allowed'), false);
    },
};

@Controller()
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @Get('subscriptions/tiers')
    listTiers() {
        return this.subscriptionsService.listTiers();
    }

    @Post('my/subscription/payment/proof')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('proof', proofUploadOptions))
    uploadPaymentProof(@UploadedFile() file?: Express.Multer.File) {
        if (!file) throw new BadRequestException('No file uploaded');
        return { path: `/uploads/subscription-proofs/${file.filename}` };
    }

    @Post('my/subscription/payment')
    @UseGuards(JwtAuthGuard)
    submitPayment(@Request() req, @Body() body: any) {
        return this.subscriptionsService.submitPayment(req.user.id, body);
    }

    @Get('admin/subscriptions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    listSubscriptions() {
        return this.subscriptionsService.listSubscriptions();
    }

    @Get('admin/subscription-tiers')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    listTiersForAdmin() {
        return this.subscriptionsService.listTiersForAdmin();
    }

    @Patch('admin/subscription-tiers/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    updateTierContent(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateTierContentDto,
        @Request() req,
    ) {
        return this.subscriptionsService.updateTierContent(id, body, req.user.id);
    }

    @Get('admin/subscription-tier-features')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    listTierFeatures() {
        return this.subscriptionsService.listTierFeatures();
    }

    @Post('admin/subscription-tier-features')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    createFeature(@Body() body: CreateTierFeatureDto, @Request() req) {
        return this.subscriptionsService.createFeature(body.featureKey, body.label, req.user.id);
    }

    @Delete('admin/subscription-tier-features/:featureKey')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    deleteFeature(@Param('featureKey') featureKey: string, @Request() req) {
        return this.subscriptionsService.deleteFeature(featureKey, req.user.id);
    }

    @Put('admin/subscription-tier-features/:tierId/:featureKey')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    setTierFeature(
        @Param('tierId', ParseIntPipe) tierId: number,
        @Param('featureKey') featureKey: string,
        @Body() body: SetTierFeatureDto,
        @Request() req,
    ) {
        return this.subscriptionsService.setTierFeature(tierId, featureKey, body.enabled, req.user.id);
    }

    @Get('admin/subscription-payments')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    listPayments(@Query('status') status?: string) {
        return this.subscriptionsService.listPayments(status);
    }

    @Patch('admin/subscription-payments/:id/review')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    reviewPayment(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
    ) {
        const decision = String(body?.decision || '').toLowerCase();
        if (decision !== 'approved' && decision !== 'rejected') {
            throw new BadRequestException('Decision must be "approved" or "rejected"');
        }
        return this.subscriptionsService.reviewPayment(req.user.id, id, decision);
    }

    @Patch('admin/users/:id/subscription')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    upgradeUser(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
    ) {
        return this.subscriptionsService.upgradeUser(req.user.id, id, Number(body?.tier_id));
    }
}
