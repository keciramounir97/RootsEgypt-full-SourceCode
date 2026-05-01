import { Knex } from "knex";
import { Request } from "express";
export declare class HealthController {
    private readonly knex;
    constructor(knex: Knex);
    private apiInfo;
    root(): {
        app: string;
        ok: boolean;
        status: string;
        color: string;
        health: string;
        live: string;
        db: string;
        routes: string;
        message: string;
    };
    routes(): {
        ok: boolean;
        routes: {
            health: string[];
            auth: string[];
            public: string[];
            user: string[];
            admin: string[];
        };
    };
    live(): {
        ok: boolean;
        status: string;
        color: string;
        database: string;
        timestamp: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        version: string;
    };
    ready(): Promise<{
        ok: boolean;
        status: string;
        color: string;
        timestamp: string;
        database: string;
        databaseError: string;
        dbHealth: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        version: string;
    }>;
    dbHealth(): Promise<{
        ok: boolean;
        status: string;
        color: string;
        database: string;
        timestamp: string;
        error?: undefined;
    } | {
        ok: boolean;
        status: string;
        color: string;
        database: string;
        error: any;
        timestamp: string;
    }>;
    proxyFallbackPreflight(): any;
    proxyFallback(req: Request): {
        ok: boolean;
        status: string;
        method: string;
        path: string;
        message: string;
        app: string;
        color: string;
        health: string;
        live: string;
        db: string;
        routes: string;
    };
    dbDiag(): Promise<Record<string, any>>;
}
