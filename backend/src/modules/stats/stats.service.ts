import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../models/User';
import { Book } from '../../models/Book';
import { Tree } from '../../models/Tree';
import { Person } from '../../models/Person';

@Injectable()
export class StatsService {
    constructor(@Inject('KnexConnection') private readonly knex) { }

    async getStats() {
        const [users, books, trees, people] = await Promise.all([
            User.query(this.knex).resultSize(),
            Book.query(this.knex).resultSize(),
            Tree.query(this.knex).resultSize(),
            Person.query(this.knex).resultSize(),
        ]);

        return { users, books, trees, people };
    }
}
