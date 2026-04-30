export declare class ActivityService {
    private readonly knex;
    constructor(knex: any);
    log(userId: number | null, type: string, description: string): Promise<void>;
    findAll(limit?: number, type?: string, q?: string): Promise<{
        id: any;
        type: any;
        description: any;
        user: any;
        date: any;
    }[]>;
}
