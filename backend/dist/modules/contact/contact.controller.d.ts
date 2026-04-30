import { MailerService } from '../../common/mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
import { ContactDto } from './dto/contact.dto';
import { ContactDataService } from './contact-data.service';
export declare class ContactController {
    private readonly mailerService;
    private readonly configService;
    private readonly contactDataService;
    constructor(mailerService: MailerService, configService: ConfigService, contactDataService: ContactDataService);
    sendContact(body: ContactDto): Promise<{
        message: string;
    }>;
    listContactMessages(): Promise<any[]>;
}
