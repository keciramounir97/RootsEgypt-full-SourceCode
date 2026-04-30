import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Model } from "objection";
import * as Knex from "knex";

const { DB_ENV_HELP, buildDbConfigErrorMessage, resolveDbConfig } = require("../../db-config");

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: "KnexConnection",
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const resolved = resolveDbConfig(
          (key: string) => configService.get<string | number>(key),
          process.env,
        );

        console.log(
          `INFO DB CONFIG bootstrap tried=${resolved.bootstrapFilesTried.join(",")} loaded=${resolved.bootstrapFilesLoaded.join(",") || "none"} resolutionSource=${resolved.resolutionSource} help="${DB_ENV_HELP}"`,
        );
        console.log(`INFO DB ENV presence ${JSON.stringify(resolved.envPresence)}`);

        if (resolved.missingFields.length > 0) {
          const errorMessage = buildDbConfigErrorMessage(resolved.missingFields);
          console.error(`ERROR DB CONFIG ${errorMessage}`);
          throw new Error(errorMessage);
        }

        console.log(
          `INFO DB CONFIG resolved source=${resolved.resolutionSource} host=${resolved.connection.host} port=${resolved.connection.port} database=${resolved.connection.database} user=${resolved.connection.user}`,
        );

        const knexConfig = {
          client: "mysql2",
          connection: {
            ...resolved.connection,
            typeCast(field: any, next: () => any) {
              if (field.type === "LONGLONG") {
                const val = field.string();
                return val === null ? null : Number(val);
              }

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
          console.log("INFO DB HANDSHAKE OK");
          return knex;
        } catch (err: any) {
          const msg =
            err?.sqlMessage ||
            err?.message ||
            err?.code ||
            JSON.stringify(err || {});
          console.error(`ERROR DB HANDSHAKE FAILED: ${msg}`);
          throw err;
        }
      },
    },
  ],
  exports: ["KnexConnection"],
})
export class DatabaseModule {}
