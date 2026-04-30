import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { NewsletterController } from './newsletter.controller';
import { MailerModule } from '../../common/mailer/mailer.module';
import { ContactDataService } from './contact-data.service';

@Module({
    imports: [MailerModule],
    controllers: [ContactController, NewsletterController],
    providers: [ContactDataService],
})
export class ContactModule { }
