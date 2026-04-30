"use strict";

const DB_ENV_HELP =
  "Production expects host-injected env vars. Set DATABASE_URL (recommended) or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME. Compatibility aliases also work: MYSQL_URL, MYSQL_URI, DB_URL, MYSQL_*, DATABASE_*.";

const ENV_FILE_STRATEGY = [".env", ".env.production", ".env.local"];

function pickFirstDefined(...values) {
  for (const value of values) {
    if (value === undefined || value === null) {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function readConnectionFromDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    return {};
  }

  try {
    const parsed = new URL(databaseUrl);
    return {
      host: parsed.hostname || undefined,
      port: Number(parsed.port || 3306),
      user: parsed.username ? decodeURIComponent(parsed.username) : undefined,
      password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
      database: (parsed.pathname || "").replace(/^\//, "") || undefined,
    };
  } catch {
    return {};
  }
}

function createLookup(getValue, env) {
  return (...keys) => {
    for (const key of keys) {
      const configValue = typeof getValue === "function" ? getValue(key) : undefined;
      const resolved = pickFirstDefined(configValue, env[key]);
      if (resolved !== undefined) {
        return resolved;
      }
    }

    return undefined;
  };
}

function resolveDbConfig(getValue, env = process.env) {
  const lookup = createLookup(getValue, env);
  const url = lookup("DATABASE_URL", "MYSQL_URL", "MYSQL_URI", "DB_URL");
  const fromUrl = readConnectionFromDatabaseUrl(url);

  const host = pickFirstDefined(
    lookup("DB_HOST", "MYSQL_HOST", "MYSQLHOST", "DATABASE_HOST"),
    fromUrl.host,
  );
  const portValue = pickFirstDefined(
    lookup("DB_PORT", "MYSQL_PORT", "DATABASE_PORT"),
    fromUrl.port,
    3306,
  );
  const user = pickFirstDefined(
    lookup("DB_USER", "MYSQL_USER", "MYSQLUSER", "DATABASE_USER"),
    fromUrl.user,
  );
  const password = pickFirstDefined(
    lookup("DB_PASSWORD", "MYSQL_PASSWORD", "MYSQLPASSWORD", "DATABASE_PASSWORD"),
    fromUrl.password,
  );
  const database = pickFirstDefined(
    lookup(
      "DB_NAME",
      "DB_DATABASE",
      "MYSQL_DATABASE",
      "MYSQLDATABASE",
      "DATABASE_NAME",
    ),
    fromUrl.database,
  );

  const port = Number(portValue || 3306);
  const envPresence = {
    url: Boolean(url),
    host: Boolean(lookup("DB_HOST", "MYSQL_HOST", "MYSQLHOST", "DATABASE_HOST")),
    port: Boolean(lookup("DB_PORT", "MYSQL_PORT", "DATABASE_PORT")),
    user: Boolean(lookup("DB_USER", "MYSQL_USER", "MYSQLUSER", "DATABASE_USER")),
    password: Boolean(
      lookup("DB_PASSWORD", "MYSQL_PASSWORD", "MYSQLPASSWORD", "DATABASE_PASSWORD"),
    ),
    database: Boolean(
      lookup(
        "DB_NAME",
        "DB_DATABASE",
        "MYSQL_DATABASE",
        "MYSQLDATABASE",
        "DATABASE_NAME",
      ),
    ),
  };

  const missingFields = [];
  if (!host) {
    missingFields.push("host");
  }
  if (!user) {
    missingFields.push("user");
  }
  if (!database) {
    missingFields.push("database");
  }

  return {
    url,
    connection: {
      host,
      port,
      user,
      password,
      database,
      charset: "utf8mb4",
    },
    envPresence,
    missingFields,
  };
}

function buildDbConfigErrorMessage(missingFields = []) {
  const suffix =
    missingFields.length > 0
      ? ` Missing categories: ${missingFields.join(", ")}.`
      : "";
  return `Database configuration is incomplete.${suffix} ${DB_ENV_HELP}`;
}

module.exports = {
  DB_ENV_HELP,
  ENV_FILE_STRATEGY,
  buildDbConfigErrorMessage,
  pickFirstDefined,
  readConnectionFromDatabaseUrl,
  resolveDbConfig,
};
