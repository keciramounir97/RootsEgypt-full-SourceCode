import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getStats(): Promise<{
        users: number;
        books: number;
        trees: number;
        people: number;
    }>;
}
