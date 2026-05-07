import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';

@Module({
    imports: [ActivityModule],
    controllers: [SuggestionsController],
    providers: [SuggestionsService],
})
export class SuggestionsModule { }
