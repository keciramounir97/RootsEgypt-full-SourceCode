"use strict";

const { getEnvBootstrapMeta, getEnvSource } = require("./env-bootstrap");

const DB_ENV_HELP =
  "Production resolves DB config in this order: host env vars, then .env. Set DATABASE_URL (recommended) or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME. Compatibility aliases also work: MYSQL_URL, MYSQL_URI, DB_URL, MYSQL_*, DATABASE_*.";

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
    const candidates = [];

    for (const key of keys) {
      const configValue = typeof getValue === "function" ? getValue(key) : undefined;
      const resolved = pickFirstDefined(configValue, env[key]);
      if (resolved !== undefined) {
        const candidate = {
          key,
          value: resolved,
          source: getEnvSource(key) || "config-service",
        };
        candidates.push(candidate);
        if (candidate.source === "host-env") {
          return candidate;
        }
      }
    }

    if (candidates.length > 0) {
      return candidates[0];
    }

    return {
      key: undefined,
      value: undefined,
      source: undefined,
    };
  };
}

function summarizeResolutionSource(fieldSources) {
  const decisiveValues = [
    fieldSources.host,
    fieldSources.port,
    fieldSources.user,
    fieldSources.password,
    fieldSources.database,
  ].filter(Boolean);
  const values = decisiveValues.length
    ? decisiveValues
    : Object.values(fieldSources).filter(Boolean);
  if (values.includes("host-env")) {
    return "host-env";
  }
  if (values.includes(".env")) {
    return ".env";
  }
  return "unknown";
}

function chooseCandidate(...candidates) {
  const defined = candidates.filter(
    (candidate) => candidate && pickFirstDefined(candidate.value) !== undefined,
  );
  if (defined.length === 0) {
    return { value: undefined, source: undefined };
  }

  const hostEnvCandidate = defined.find((candidate) => candidate.source === "host-env");
  if (hostEnvCandidate) {
    return hostEnvCandidate;
  }

  return defined[0];
}

function resolveDbConfig(getValue, env = process.env) {
  const lookup = createLookup(getValue, env);
  const urlCandidate = lookup("DATABASE_URL", "MYSQL_URL", "MYSQL_URI", "DB_URL");
  const fromUrl = readConnectionFromDatabaseUrl(urlCandidate.value);
  const urlSource = urlCandidate.source || "url";

  const hostCandidate = lookup("DB_HOST", "MYSQL_HOST", "MYSQLHOST", "DATABASE_HOST");
  const portCandidate = lookup("DB_PORT", "MYSQL_PORT", "DATABASE_PORT");
  const userCandidate = lookup("DB_USER", "MYSQL_USER", "MYSQLUSER", "DATABASE_USER");
  const passwordCandidate = lookup(
    "DB_PASSWORD",
    "MYSQL_PASSWORD",
    "MYSQLPASSWORD",
    "DATABASE_PASSWORD",
  );
  const databaseCandidate = lookup(
    "DB_NAME",
    "DB_DATABASE",
    "MYSQL_DATABASE",
    "MYSQLDATABASE",
    "DATABASE_NAME",
  );

  const chosenHost = chooseCandidate(hostCandidate, {
    value: fromUrl.host,
    source: fromUrl.host ? urlSource : undefined,
  });
  const chosenPort = chooseCandidate(portCandidate, {
    value: fromUrl.port,
    source: fromUrl.port ? urlSource : undefined,
  });
  const chosenUser = chooseCandidate(userCandidate, {
    value: fromUrl.user,
    source: fromUrl.user ? urlSource : undefined,
  });
  const chosenPassword = chooseCandidate(passwordCandidate, {
    value: fromUrl.password,
    source: fromUrl.password ? urlSource : undefined,
  });
  const chosenDatabase = chooseCandidate(databaseCandidate, {
    value: fromUrl.database,
    source: fromUrl.database ? urlSource : undefined,
  });

  const host = chosenHost.value;
  const portValue = pickFirstDefined(chosenPort.value, 3306);
  const user = chosenUser.value;
  const password = chosenPassword.value;
  const database = chosenDatabase.value;
  const port = Number(portValue || 3306);

  const fieldSources = {
    url: urlCandidate.value ? urlSource : undefined,
    host: chosenHost.source,
    port: chosenPort.source,
    user: chosenUser.source,
    password: chosenPassword.source,
    database: chosenDatabase.source,
  };

  const envPresence = {
    url: Boolean(urlCandidate.value),
    host: Boolean(hostCandidate.value),
    port: Boolean(portCandidate.value),
    user: Boolean(userCandidate.value),
    password: Boolean(passwordCandidate.value),
    database: Boolean(databaseCandidate.value),
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

  const bootstrapMeta = getEnvBootstrapMeta();

  return {
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
    fieldSources,
    resolutionSource: summarizeResolutionSource(fieldSources),
    bootstrapFilesTried: bootstrapMeta.candidateFiles,
    bootstrapFilesLoaded: bootstrapMeta.loadedFiles,
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
  buildDbConfigErrorMessage,
  pickFirstDefined,
  readConnectionFromDatabaseUrl,
  resolveDbConfig,
};
