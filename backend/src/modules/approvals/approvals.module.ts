import { Module } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController, UserRequestsController } from './approvals.controller';
import { ActivityModule } from '../activity/activity.module';
import { MailerModule } from '../../common/mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ActivityModule, MailerModule, ConfigModule],
    controllers: [ApprovalsController, UserRequestsController],
    providers: [ApprovalsService],
    exports: [ApprovalsService],
})
export class ApprovalsModule { }
