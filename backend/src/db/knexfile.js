const { bootstrapEnv } = require("../../env-bootstrap");
const { buildDbConfigErrorMessage, resolveDbConfig } = require("../../db-config");

bootstrapEnv();

const resolved = resolveDbConfig(undefined, process.env);
if (resolved.missingFields.length > 0) {
  throw new Error(buildDbConfigErrorMessage(resolved.missingFields));
}

module.exports = {
  client: "mysql2",
  connection: resolved.connection,
  pool: {
    min: 0,
    max: 5,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  },
  debug: process.env.NODE_ENV === "development",
  migrations: {
    directory: "./src/db/migrations",
    extension: process.env.NODE_ENV === "production" ? "js" : "ts",
  },
  seeds: {
    directory: "./src/db/seeds",
  },
};
