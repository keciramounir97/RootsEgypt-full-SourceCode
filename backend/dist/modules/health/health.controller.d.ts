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
        error?: undefined;
    } | {
        ok: boolean;
        status: string;
        timestamp: string;
        database: string;
        error: any;
        uptime: number;
        version?: undefined;
    }>;
    dbHealth(): Promise<{
        ok: boolean;
        database: string;
        timestamp: string;
        error?: undefined;
    } | {
        ok: boolean;
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
        health: string;
        live: string;
        db: string;
        routes: string;
    };
    dbDiag(): Promise<Record<string, any>>;
}
