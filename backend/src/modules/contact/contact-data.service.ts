import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ContactDataService {
    constructor(@Inject('KnexConnection') private readonly knex) { }

    async saveContactMessage(payload: { name: string; email: string; message: string }) {
        const [id] = await this.knex('contact_messages').insert({
            name: payload.name,
            email: payload.email,
            message: payload.message,
            created_at: this.knex.fn.now(),
        });
        return id;
    }

    async listContactMessages() {
        return this.knex('contact_messages')
            .select('*')
            .orderBy('created_at', 'desc');
    }

    async upsertNewsletterSubscriber(email: string) {
        const existing = await this.knex('newsletter_subscribers')
            .where('email', email)
            .first();
        if (existing) return existing.id;

        const [id] = await this.knex('newsletter_subscribers').insert({
            email,
            created_at: this.knex.fn.now(),
        });
        return id;
    }

    async listNewsletterSubscribers() {
        return this.knex('newsletter_subscribers')
            .select('*')
            .orderBy('created_at', 'desc');
    }
}
