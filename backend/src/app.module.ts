import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BooksModule } from './modules/books/books.module';
import { TreesModule } from './modules/trees/trees.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { ContactModule } from './modules/contact/contact.module';
import { ActivityModule } from './modules/activity/activity.module';
import { StatsModule } from './modules/stats/stats.module';
import { SearchModule } from './modules/search/search.module';
import { HealthModule } from './modules/health/health.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { AudiosModule } from './modules/audios/audios.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SuggestionsModule } from './modules/suggestions/suggestions.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ActivityModule,
    AuthModule,
    UsersModule,
    BooksModule,
    TreesModule,
    GalleryModule,
    ContactModule,
    StatsModule,
    SearchModule,
    HealthModule,
    ApprovalsModule,
    ArticlesModule,
    AudiosModule,
    DocumentsModule,
    SuggestionsModule,
    SettingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
