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
        const fromUrl = readConnectionFromDatabaseUrl(dbUrl);
        const host = pickFirstDefined(
          configService.get<string>("DB_HOST"),
          configService.get<string>("MYSQL_HOST"),
          configService.get<string>("MYSQLHOST"),
          process.env.DB_HOST,
          process.env.MYSQL_HOST,
          process.env.MYSQLHOST,
          fromUrl.host,
          // Last-resort defaults for this deployment stack.
          "rootsegypt_database-egypt",
        );
        const port = Number(
          pickFirstDefined(
            configService.get<number>("DB_PORT"),
            configService.get<number>("MYSQL_PORT"),
            process.env.DB_PORT,
            process.env.MYSQL_PORT,
            fromUrl.port,
            3306,
          ),
        );
        const user = pickFirstDefined(
          configService.get<string>("DB_USER"),
          configService.get<string>("MYSQL_USER"),
          configService.get<string>("MYSQLUSER"),
          process.env.DB_USER,
          process.env.MYSQL_USER,
          process.env.MYSQLUSER,
          fromUrl.user,
          "adminEgypt",
        );
        const password = pickFirstDefined(
          configService.get<string>("DB_PASSWORD"),
          configService.get<string>("MYSQL_PASSWORD"),
          configService.get<string>("MYSQLPASSWORD"),
          process.env.DB_PASSWORD,
          process.env.MYSQL_PASSWORD,
          process.env.MYSQLPASSWORD,
          fromUrl.password,
          "Egypt20252026$$$",
        );
        const database = pickFirstDefined(
          configService.get<string>("DB_NAME"),
          configService.get<string>("DB_DATABASE"),
          configService.get<string>("MYSQL_DATABASE"),
          configService.get<string>("MYSQLDATABASE"),
          process.env.DB_NAME,
          process.env.DB_DATABASE,
          process.env.MYSQL_DATABASE,
          process.env.MYSQLDATABASE,
          fromUrl.database,
          "rootsEgypt",
        );

        if (!host || !user || !database) {
          console.warn(
            "⚠️ Incomplete DB env detected, using fallback defaults for EasyPanel startup.",
          );
        }

        // Startup diagnostics for container logs (no password output).
        console.log(
          `🟡 DB CONFIG host=${host} port=${port} database=${database} user=${user}`,
        );

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
