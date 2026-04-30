"use strict";

const path = require("path");
const { spawn } = require("child_process");

const knexLib = require("knex");
const { bootstrapEnv, getEnvBootstrapMeta } = require("../env-bootstrap");
const {
  DB_ENV_HELP,
  buildDbConfigErrorMessage,
  resolveDbConfig,
} = require("../db-config");

const createKnex = knexLib.default || knexLib;
const APP_ROOT = path.resolve(__dirname, "..");
const MAX_RETRIES = Number(process.env.EASYPANEL_DB_RETRIES || 10);
const RETRY_DELAY_MS = Number(process.env.EASYPANEL_DB_RETRY_DELAY_MS || 5000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getKnexConfig() {
  return require(path.join(APP_ROOT, "knexfile.js"));
}

function logBootstrap(resolved) {
  const envMeta = getEnvBootstrapMeta();
  console.log(
    `EASYPANEL bootstrap tried=${envMeta.candidateFiles.join(",")} loaded=${envMeta.loadedFiles.join(",") || "none"} resolutionSource=${resolved.resolutionSource}`,
  );
  console.log(`EASYPANEL env presence ${JSON.stringify(resolved.envPresence)}`);
  console.log(
    `EASYPANEL db target host=${resolved.connection.host} port=${resolved.connection.port} database=${resolved.connection.database} user=${resolved.connection.user}`,
  );
}

function validateResolvedConfig(resolved) {
  if (resolved.missingFields.length > 0) {
    const errorMessage = buildDbConfigErrorMessage(resolved.missingFields);
    console.error(`EASYPANEL db config error: ${errorMessage}`);
    throw new Error(errorMessage);
  }
}

async function runMigrationsWithRetry() {
  const knexConfig = getKnexConfig();
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const knex = createKnex(knexConfig);
    try {
      console.log(`EASYPANEL migration attempt ${attempt}/${MAX_RETRIES}`);
      await knex.raw("SELECT 1");
      await knex.migrate.latest({
        directory: path.join(APP_ROOT, "src", "db", "migrations"),
      });
      console.log("EASYPANEL migrations complete");
      await knex.destroy();
      return;
    } catch (error) {
      lastError = error;
      const message =
        error?.sqlMessage || error?.message || error?.code || String(error);
      console.warn(`EASYPANEL migration attempt ${attempt} failed: ${message}`);
      try {
        await knex.destroy();
      } catch {
        // ignore destroy failures during retry
      }

      if (attempt < MAX_RETRIES) {
        console.log(
          `EASYPANEL waiting ${RETRY_DELAY_MS}ms before retrying database startup...`,
        );
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  throw lastError || new Error("Database migration failed");
}

function startServer() {
  console.log("EASYPANEL starting Nest server...");

  const child = spawn(process.execPath, ["server.js"], {
    cwd: APP_ROOT,
    env: process.env,
    stdio: "inherit",
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on("SIGINT", () => forwardSignal("SIGINT"));
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code || 0);
  });
}

async function main() {
  process.chdir(APP_ROOT);
  bootstrapEnv({ cwd: APP_ROOT, env: process.env });

  const resolved = resolveDbConfig(undefined, process.env);
  logBootstrap(resolved);
  validateResolvedConfig(resolved);

  if (String(process.env.EASYPANEL_VALIDATE_ONLY || "").toLowerCase() === "true") {
    console.log(`EASYPANEL validation only complete. ${DB_ENV_HELP}`);
    return;
  }

  await runMigrationsWithRetry();
  startServer();
}

if (require.main === module) {
  main().catch((error) => {
    const message =
      error?.sqlMessage || error?.message || error?.code || String(error);
    console.error(`EASYPANEL startup failed: ${message}`);
    process.exit(1);
  });
}

module.exports = {
  APP_ROOT,
  main,
  runMigrationsWithRetry,
};
