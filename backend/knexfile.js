const { bootstrapEnv, getEnvBootstrapMeta } = require("./env-bootstrap");
const { buildDbConfigErrorMessage, resolveDbConfig } = require("./db-config");

const envMeta = bootstrapEnv();

const resolved = resolveDbConfig(undefined, process.env);

// Always log diagnostic info so EasyPanel container logs are useful
console.log(
  `[knexfile] NODE_ENV=${process.env.NODE_ENV || "undefined"} cwd=${process.cwd()} ` +
    `envFiles.tried=${envMeta.candidateFiles.join(",") || "none"} ` +
    `envFiles.loaded=${envMeta.loadedFiles.join(",") || "none"} ` +
    `resolution=${resolved.resolutionSource} family=${resolved.selectedFamilyName}`,
);
console.log(
  `[knexfile] env presence: DATABASE_URL=${resolved.envPresence.hasDatabaseUrl} ` +
    `DB_HOST=${resolved.envPresence.hasDbHost} DB_USER=${resolved.envPresence.hasDbUser} ` +
    `DB_NAME=${resolved.envPresence.hasDbName}`,
);

if (resolved.missingFields.length > 0) {
  // Dump all DB-related env var keys (values redacted) for debugging
  const dbKeys = Object.keys(process.env).filter((k) =>
    /^(DB_|DATABASE_|MYSQL|EASYPANEL)/i.test(k),
  );
  console.error(
    `[knexfile] FATAL: missing=${resolved.missingFields.join(",")} ` +
      `dbRelatedEnvKeys=[${dbKeys.join(",")}]`,
  );
  console.error(
    `[knexfile] HINT: In EasyPanel, go to your backend service → Environment tab ` +
      `and add DATABASE_URL=mysql://user:pass@hostname:3306/dbname ` +
      `(copy the Internal Connection URL from your MySQL service).`,
  );
  throw new Error(
    buildDbConfigErrorMessage(
      resolved.missingFields,
      resolved.missingVariableNames,
    ),
  );
}

console.log(
  `[knexfile] OK: host=${resolved.connection.host} port=${resolved.connection.port} ` +
      `db=${resolved.connection.database} user=${resolved.connection.user}`,
);

module.exports = {
  client: resolved.client,
  connection: resolved.knexConnection,
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  migrations: {
    directory: "./src/db/migrations",
    extension: "js",
  },
  seeds: {
    directory: "./src/db/seeds",
  },
};
