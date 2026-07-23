import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { AdminSiteImagesController, PublicSiteImagesController, PublicPaymentSettingsController, SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
    imports: [ActivityModule],
    controllers: [SettingsController, PublicSiteImagesController, PublicPaymentSettingsController, AdminSiteImagesController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
