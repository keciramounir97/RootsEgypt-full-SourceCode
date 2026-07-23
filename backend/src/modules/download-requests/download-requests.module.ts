import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { MailerModule } from '../../common/mailer/mailer.module';
import { DownloadRequestsController, AdminDownloadRequestsController } from './download-requests.controller';
import { DownloadRequestsService } from './download-requests.service';

@Module({
    imports: [ActivityModule, MailerModule],
    controllers: [DownloadRequestsController, AdminDownloadRequestsController],
    providers: [DownloadRequestsService],
    exports: [DownloadRequestsService],
})
export class DownloadRequestsModule {}
