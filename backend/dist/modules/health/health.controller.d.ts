import { Knex } from "knex";
export declare class HealthController {
    private readonly knex;
    constructor(knex: Knex);
    live(): {
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
    };
    ready(): Promise<{
        ok: boolean;
        status: string;
        timestamp: string;
        database: string;
        uptime: number;
        version: string;
    }>;
    dbHealth(): Promise<{
        ok: boolean;
        database: string;
        timestamp: string;
    }>;
    dbDiag(): Promise<Record<string, any>>;
}
