import { Knex } from "knex";
export declare class ContactDataService {
    private readonly knex;
    constructor(knex: Knex);
    saveContactMessage(payload: {
        name: string;
        email: string;
        message: string;
    }): Promise<number>;
    listContactMessages(): Promise<any[]>;
    upsertNewsletterSubscriber(email: string): Promise<any>;
    listNewsletterSubscribers(): Promise<any[]>;
}
