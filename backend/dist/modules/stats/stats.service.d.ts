export declare class StatsService {
    private readonly knex;
    constructor(knex: any);
    getStats(): Promise<{
        users: number;
        books: number;
        trees: number;
        people: number;
    }>;
}
