#!/usr/bin/env node
"use strict";

const path = require("path");
const knexLib = require("knex");

const { bootstrapEnv, getEnvBootstrapMeta } = require("../env-bootstrap");
const {
  DB_ENV_HELP,
  buildDbConfigErrorMessage,
  resolveDbConfig,
} = require("../db-config");

const createKnex = knexLib.default || knexLib;
const APP_ROOT = path.resolve(__dirname, "..");

function mainLog(resolved) {
  const envMeta = getEnvBootstrapMeta();
  console.log(
    `MIGRATE bootstrap tried=${envMeta.candidateFiles.join(",")} loaded=${envMeta.loadedFiles.join(",") || "none"} loadedPaths=${envMeta.loadedPaths.join(",") || "none"} resolutionSource=${resolved.resolutionSource}`,
  );
  console.log(
    `MIGRATE env presence ${JSON.stringify({
      NODE_ENV: resolved.envPresence.nodeEnv,
      DATABASE_URL: resolved.envPresence.hasDatabaseUrl,
      DB_HOST: resolved.envPresence.hasDbHost,
      DB_USER: resolved.envPresence.hasDbUser,
      DB_NAME: resolved.envPresence.hasDbName,
    })}`,
  );
  console.log(
    `MIGRATE db target host=${resolved.connection.host} port=${resolved.connection.port} database=${resolved.connection.database} user=${resolved.connection.user}`,
  );
}

async function main() {
  process.chdir(APP_ROOT);
  bootstrapEnv({ cwd: APP_ROOT, env: process.env });

  const resolved = resolveDbConfig(undefined, process.env);
  mainLog(resolved);

  if (resolved.missingFields.length > 0) {
    throw new Error(
      buildDbConfigErrorMessage(resolved.missingFields, resolved.missingVariableNames),
    );
  }

  const knexConfig = require(path.join(APP_ROOT, "knexfile.js"));
  const knex = createKnex(knexConfig);

  try {
    await knex.raw("SELECT 1");
    const [batchNo, migrations] = await knex.migrate.latest({
      directory: path.join(APP_ROOT, "src", "db", "migrations"),
    });
    console.log(
      `MIGRATE complete batch=${batchNo} ran=${Array.isArray(migrations) ? migrations.length : 0}`,
    );
    if (Array.isArray(migrations) && migrations.length > 0) {
      console.log(`MIGRATE files ${migrations.join(",")}`);
    }
  } catch (error) {
    const message =
      error?.sqlMessage || error?.message || error?.code || String(error);
    console.error(`MIGRATE failed: ${message}`);
    console.error(DB_ENV_HELP);
    process.exitCode = 1;
  } finally {
    await knex.destroy();
  }
}

main().catch((error) => {
  const message =
    error?.sqlMessage || error?.message || error?.code || String(error);
  console.error(`MIGRATE startup error: ${message}`);
  console.error(DB_ENV_HELP);
  process.exit(1);
});
