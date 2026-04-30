export declare class ContactDataService {
    private readonly knex;
    constructor(knex: any);
    saveContactMessage(payload: {
        name: string;
        email: string;
        message: string;
    }): Promise<any>;
    listContactMessages(): Promise<any>;
    upsertNewsletterSubscriber(email: string): Promise<any>;
    listNewsletterSubscribers(): Promise<any>;
}
