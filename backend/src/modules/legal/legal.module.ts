import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { PublicLegalController, AdminLegalController } from './legal.controller';
import { LegalService } from './legal.service';

@Module({
    imports: [ActivityModule],
    controllers: [PublicLegalController, AdminLegalController],
    providers: [LegalService],
    exports: [LegalService],
})
export class LegalModule { }
