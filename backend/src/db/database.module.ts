import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Model } from "objection";
import * as Knex from "knex";

type DbConnectionConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  charset: string;
};

function readConnectionFromDatabaseUrl(
  databaseUrl?: string,
): Partial<DbConnectionConfig> {
  if (!databaseUrl) return {};
  try {
    const parsed = new URL(databaseUrl);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username || ""),
      password: decodeURIComponent(parsed.password || ""),
      database: (parsed.pathname || "").replace(/^\//, ""),
    };
  } catch {
    return {};
  }
}

function pickFirstDefined(
  ...values: Array<string | number | undefined | null>
): string | undefined {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return undefined;
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: "KnexConnection",
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbUrl = configService.get<string>("DATABASE_URL");
        const mysqlUrl =
          configService.get<string>("MYSQL_URL") ||
          configService.get<string>("MYSQL_URI") ||
          configService.get<string>("DB_URL") ||
          process.env.MYSQL_URL ||
          process.env.MYSQL_URI ||
          process.env.DB_URL;
        const fromUrl = readConnectionFromDatabaseUrl(dbUrl || mysqlUrl);
        const host = pickFirstDefined(
          configService.get<string>("DB_HOST"),
          configService.get<string>("MYSQL_HOST"),
          configService.get<string>("MYSQLHOST"),
          process.env.DB_HOST,
          process.env.MYSQL_HOST,
          process.env.MYSQLHOST,
          fromUrl.host,
        );
        const port = Number(
          pickFirstDefined(
          configService.get<number>("DB_PORT"),
          configService.get<number>("MYSQL_PORT"),
          configService.get<number>("DATABASE_PORT"),
          process.env.DB_PORT,
          process.env.MYSQL_PORT,
          process.env.DATABASE_PORT,
          fromUrl.port,
          3306,
        ),
        );
        const user = pickFirstDefined(
          configService.get<string>("DB_USER"),
          configService.get<string>("MYSQL_USER"),
          configService.get<string>("MYSQLUSER"),
          configService.get<string>("DATABASE_USER"),
          process.env.DB_USER,
          process.env.MYSQL_USER,
          process.env.MYSQLUSER,
          process.env.DATABASE_USER,
          fromUrl.user,
        );
        const password = pickFirstDefined(
          configService.get<string>("DB_PASSWORD"),
          configService.get<string>("MYSQL_PASSWORD"),
          configService.get<string>("MYSQLPASSWORD"),
          configService.get<string>("DATABASE_PASSWORD"),
          process.env.DB_PASSWORD,
          process.env.MYSQL_PASSWORD,
          process.env.MYSQLPASSWORD,
          process.env.DATABASE_PASSWORD,
          fromUrl.password,
        );
        const database = pickFirstDefined(
          configService.get<string>("DB_NAME"),
          configService.get<string>("DB_DATABASE"),
          configService.get<string>("MYSQL_DATABASE"),
          configService.get<string>("MYSQLDATABASE"),
          configService.get<string>("DATABASE_NAME"),
          process.env.DB_NAME,
          process.env.DB_DATABASE,
          process.env.MYSQL_DATABASE,
          process.env.MYSQLDATABASE,
          process.env.DATABASE_NAME,
          fromUrl.database,
        );

        if (!host || !user || !database) {
          throw new Error(
            "Database configuration is incomplete. Set DATABASE_URL or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME.",
          );
        }

        // Startup diagnostics for container logs (no password output).
        const envPresence = {
          DATABASE_URL: !!(dbUrl || mysqlUrl),
          DB_HOST: !!pickFirstDefined(process.env.DB_HOST, process.env.MYSQL_HOST, process.env.MYSQLHOST),
          DB_PORT: !!pickFirstDefined(process.env.DB_PORT, process.env.MYSQL_PORT, process.env.DATABASE_PORT),
          DB_USER: !!pickFirstDefined(process.env.DB_USER, process.env.MYSQL_USER, process.env.MYSQLUSER, process.env.DATABASE_USER),
          DB_PASSWORD: !!pickFirstDefined(process.env.DB_PASSWORD, process.env.MYSQL_PASSWORD, process.env.MYSQLPASSWORD, process.env.DATABASE_PASSWORD),
          DB_NAME: !!pickFirstDefined(process.env.DB_NAME, process.env.DB_DATABASE, process.env.MYSQL_DATABASE, process.env.MYSQLDATABASE, process.env.DATABASE_NAME),
        };
        console.log(
          `🟡 DB CONFIG host=${host} port=${port} database=${database} user=${user}`,
        );
        console.log(`🟡 DB ENV presence ${JSON.stringify(envPresence)}`);

        const knexConfig = {
          client: "mysql2",
          connection: {
            host,
            port,
            user,
            password,
            database,
            charset: "utf8mb4",
            typeCast(field: any, next: () => any) {
              // MySQL2 v3 returns BIGINT as JS BigInt which breaks JSON.stringify
              if (field.type === "LONGLONG") {
                const val = field.string();
                return val === null ? null : Number(val);
              }
              // Return TINYINT(1) as proper JS boolean
              if (field.type === "TINY" && field.length === 1) {
                const val = field.string();
                return val === null ? null : val === "1";
              }
              return next();
            },
          },
          pool: {
            min: 0,
            max: 5,
            acquireTimeoutMillis: 30000,
            createTimeoutMillis: 30000,
            destroyTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
          },
          debug: configService.get<string>("NODE_ENV") === "development",
        };

        try {
          const knex = Knex.default(knexConfig);
          Model.knex(knex);
          await knex.raw("SELECT 1");
          console.log("🟢 DB HANDSHAKE OK");
          return knex;
        } catch (err: any) {
          const msg =
            err?.sqlMessage ||
            err?.message ||
            err?.code ||
            JSON.stringify(err || {});
          console.error(`🔴 DB HANDSHAKE FAILED: ${msg}`);
          throw err;
        }
      },
    },
  ],
  exports: ["KnexConnection"],
})
export class DatabaseModule {}
