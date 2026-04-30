import { Global, Module } from '@nestjs/common';
import { Model } from 'objection';
import * as Knex from 'knex';

const knexConfig = {
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
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
