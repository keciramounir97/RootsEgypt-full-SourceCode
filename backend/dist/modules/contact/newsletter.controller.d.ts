import { MailerService } from "../../common/mailer/mailer.service";
import { ConfigService } from "@nestjs/config";
import { ActivityService } from "../activity/activity.service";
import { ContactDataService } from "./contact-data.service";
export declare class NewsletterController {
    private readonly mailerService;
    private readonly configService;
    private readonly activityService;
    private readonly contactDataService;
    constructor(mailerService: MailerService, configService: ConfigService, activityService: ActivityService, contactDataService: ContactDataService);
    subscribe(body: {
        email?: string;
    }): Promise<{
        message: string;
    }>;
    listSubscribers(): Promise<any[]>;
}
