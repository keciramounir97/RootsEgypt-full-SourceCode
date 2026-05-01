"use strict";

const { bootstrapEnv } = require("./env-bootstrap");
const { resolveDbConfig } = require("./db-config");

bootstrapEnv({ cwd: __dirname, env: process.env });

const resolved = resolveDbConfig(undefined, process.env);

module.exports = {
  client: resolved.client,
  connection: resolved.knexConnection,
  migrations: {
    directory: "./src/db/migrations",
    extension: "js",
  },
  seeds: {
    directory: "./src/db/seeds",
  },
};
