import { Knex } from "knex";
export declare class StatsService {
    private readonly knex;
    constructor(knex: Knex);
    getStats(): Promise<{
        users: number;
        books: number;
        trees: number;
        people: number;
    }>;
}
