import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { AdminSiteImagesController, PublicSiteImagesController, SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
    imports: [ActivityModule],
    controllers: [SettingsController, PublicSiteImagesController, AdminSiteImagesController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
