import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";
export declare class MailerService {
    private configService;
    private transporter;
    private readonly logger;
    private readonly enabled;
    constructor(configService: ConfigService);
    sendMail(options: nodemailer.SendMailOptions): Promise<any>;
}
