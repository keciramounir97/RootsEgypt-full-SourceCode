import { Global, Module } from '@nestjs/common';
import { Model } from 'objection';
import * as Knex from 'knex';

function readConnectionFromDatabaseUrl(databaseUrl?: string) {
    if (!databaseUrl) return {};
    try {
        const parsed = new URL(databaseUrl);
        return {
            host: parsed.hostname,
            port: Number(parsed.port || 3306),
            user: decodeURIComponent(parsed.username || ''),
            password: decodeURIComponent(parsed.password || ''),
            database: (parsed.pathname || '').replace(/^\//, ''),
        };
    } catch {
        return {};
    }
}

function pickFirstDefined(...values: Array<string | number | undefined | null>) {
    for (const value of values) {
        if (value === undefined || value === null) continue;
        const normalized = String(value).trim();
        if (normalized) return normalized;
    }
    return undefined;
}

const fromUrl = readConnectionFromDatabaseUrl(process.env.DATABASE_URL);

const knexConfig = {
    client: 'mysql2',
    connection: {
        host: pickFirstDefined(process.env.DB_HOST, process.env.MYSQL_HOST, process.env.MYSQLHOST, fromUrl.host),
        port: Number(pickFirstDefined(process.env.DB_PORT, process.env.MYSQL_PORT, fromUrl.port, 3306)),
        user: pickFirstDefined(process.env.DB_USER, process.env.MYSQL_USER, process.env.MYSQLUSER, fromUrl.user),
        password: pickFirstDefined(process.env.DB_PASSWORD, process.env.MYSQL_PASSWORD, process.env.MYSQLPASSWORD, fromUrl.password),
        database: pickFirstDefined(process.env.DB_NAME, process.env.DB_DATABASE, process.env.MYSQL_DATABASE, process.env.MYSQLDATABASE, fromUrl.database),
        charset: 'utf8mb4',
    },
    pool: {
        min: 0,
        max: 5, // Passenger optimized
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
    },
    debug: process.env.NODE_ENV === 'development',
};

@Global()
@Module({
    providers: [
        {
            provide: 'KnexConnection',
            useFactory: async () => {
                const knex = Knex.default(knexConfig);
                Model.knex(knex);
                return knex;
            },
        },
    ],
    exports: ['KnexConnection'],
})
export class DatabaseModule { }
