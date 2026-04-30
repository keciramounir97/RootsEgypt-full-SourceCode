"use strict";

const { getEnvBootstrapMeta, getEnvSource } = require("./env-bootstrap");

const DB_ENV_HELP =
  "Production resolves DB config in this order: DATABASE_URL, then DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME, then MYSQL_HOST/MYSQL_PORT/MYSQL_USER/MYSQL_PASSWORD/MYSQL_DATABASE. Compatibility URL aliases also work: DB_URL, MYSQL_URL, MYSQL_URI. In production, .env.production is loaded only when process.env values are missing; local .env files are for development.";

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
        return {
          key,
          value: resolved,
          source: getEnvSource(key) || "config-service",
        };
      }
    }

    return {
      key: undefined,
      value: undefined,
      source: undefined,
    };
  };
}

function normalizePort(value) {
  const normalized = Number(pickFirstDefined(value, 3306));
  return Number.isFinite(normalized) ? normalized : 3306;
}

function hasAnyFamilyValue(family) {
  return Object.values(family).some((candidate) =>
    pickFirstDefined(candidate?.value) !== undefined,
  );
}

function hasHostEnvValue(candidate) {
  return candidate?.source === "host-env" && pickFirstDefined(candidate?.value) !== undefined;
}

function hasAnyHostFamilyValue(family) {
  return Object.values(family).some((candidate) => hasHostEnvValue(candidate));
}

function buildConnectionFromFamily(family) {
  return {
    host: family.host?.value,
    port: normalizePort(family.port?.value),
    user: family.user?.value,
    password: family.password?.value,
    database: family.database?.value,
  };
}

function listMissingFamilyVariables(familyName, connection) {
  if (familyName === "DATABASE_URL") {
    const missing = [];
    if (!connection.host) {
      missing.push("DATABASE_URL(host)");
    }
    if (!connection.user) {
      missing.push("DATABASE_URL(user)");
    }
    if (!connection.database) {
      missing.push("DATABASE_URL(database)");
    }
    return missing;
  }

  if (familyName === "DB_*") {
    const missing = [];
    if (!connection.host) {
      missing.push("DB_HOST");
    }
    if (!connection.user) {
      missing.push("DB_USER");
    }
    if (!connection.database) {
      missing.push("DB_NAME");
    }
    return missing;
  }

  if (familyName === "MYSQL_*") {
    const missing = [];
    if (!connection.host) {
      missing.push("MYSQL_HOST");
    }
    if (!connection.user) {
      missing.push("MYSQL_USER");
    }
    if (!connection.database) {
      missing.push("MYSQL_DATABASE");
    }
    return missing;
  }

  const missing = [];
  if (!connection.host) {
    missing.push("DB_URL|MYSQL_URL|MYSQL_URI(host)");
  }
  if (!connection.user) {
    missing.push("DB_URL|MYSQL_URL|MYSQL_URI(user)");
  }
  if (!connection.database) {
    missing.push("DB_URL|MYSQL_URL|MYSQL_URI(database)");
  }
  return missing;
}

function summarizeResolutionSource(primarySource) {
  if (primarySource === "host-env") {
    return "host-env";
  }

  if (String(primarySource || "").includes(".env.production")) {
    return ".env.production";
  }

  if (String(primarySource || "").includes(".env")) {
    return ".env";
  }

  return primarySource || "unknown";
}

function resolveDbConfig(getValue, env = process.env) {
  const lookup = createLookup(getValue, env);

  const directUrlCandidate = lookup("DATABASE_URL");
  const compatibilityUrlCandidate = lookup("DB_URL", "MYSQL_URL", "MYSQL_URI");

  const dbFamily = {
    host: lookup("DB_HOST", "DATABASE_HOST"),
    port: lookup("DB_PORT", "DATABASE_PORT"),
    user: lookup("DB_USER", "DATABASE_USER"),
    password: lookup("DB_PASSWORD", "DATABASE_PASSWORD"),
    database: lookup("DB_NAME", "DB_DATABASE", "DATABASE_NAME"),
  };

  const mysqlFamily = {
    host: lookup("MYSQL_HOST", "MYSQLHOST"),
    port: lookup("MYSQL_PORT"),
    user: lookup("MYSQL_USER", "MYSQLUSER"),
    password: lookup("MYSQL_PASSWORD", "MYSQLPASSWORD"),
    database: lookup("MYSQL_DATABASE", "MYSQLDATABASE"),
  };

  let selectedFamilyName = "none";
  let selectedUrl = undefined;
  let connection = {
    host: undefined,
    port: 3306,
    user: undefined,
    password: undefined,
    database: undefined,
  };
  let primarySource = undefined;

  if (hasHostEnvValue(directUrlCandidate)) {
    selectedFamilyName = "DATABASE_URL";
    selectedUrl = directUrlCandidate.value;
    connection = {
      ...connection,
      ...readConnectionFromDatabaseUrl(directUrlCandidate.value),
    };
    primarySource = directUrlCandidate.source || "DATABASE_URL";
  } else if (hasAnyHostFamilyValue(dbFamily)) {
    selectedFamilyName = "DB_*";
    connection = {
      ...connection,
      ...buildConnectionFromFamily(dbFamily),
    };
    primarySource =
      dbFamily.host.source ||
      dbFamily.user.source ||
      dbFamily.database.source ||
      dbFamily.port.source ||
      dbFamily.password.source;
  } else if (hasAnyHostFamilyValue(mysqlFamily)) {
    selectedFamilyName = "MYSQL_*";
    connection = {
      ...connection,
      ...buildConnectionFromFamily(mysqlFamily),
    };
    primarySource =
      mysqlFamily.host.source ||
      mysqlFamily.user.source ||
      mysqlFamily.database.source ||
      mysqlFamily.port.source ||
      mysqlFamily.password.source;
  } else if (directUrlCandidate.value) {
    selectedFamilyName = "DATABASE_URL";
    selectedUrl = directUrlCandidate.value;
    connection = {
      ...connection,
      ...readConnectionFromDatabaseUrl(directUrlCandidate.value),
    };
    primarySource = directUrlCandidate.source || "DATABASE_URL";
  } else if (hasAnyFamilyValue(dbFamily)) {
    selectedFamilyName = "DB_*";
    connection = {
      ...connection,
      ...buildConnectionFromFamily(dbFamily),
    };
    primarySource =
      dbFamily.host.source ||
      dbFamily.user.source ||
      dbFamily.database.source ||
      dbFamily.port.source ||
      dbFamily.password.source;
  } else if (hasAnyFamilyValue(mysqlFamily)) {
    selectedFamilyName = "MYSQL_*";
    connection = {
      ...connection,
      ...buildConnectionFromFamily(mysqlFamily),
    };
    primarySource =
      mysqlFamily.host.source ||
      mysqlFamily.user.source ||
      mysqlFamily.database.source ||
      mysqlFamily.port.source ||
      mysqlFamily.password.source;
  } else if (compatibilityUrlCandidate.value) {
    selectedFamilyName = "URL_ALIAS";
    selectedUrl = compatibilityUrlCandidate.value;
    connection = {
      ...connection,
      ...readConnectionFromDatabaseUrl(compatibilityUrlCandidate.value),
    };
    primarySource = compatibilityUrlCandidate.source || compatibilityUrlCandidate.key;
  }

  const envPresence = {
    nodeEnv: pickFirstDefined(env.NODE_ENV, "undefined"),
    hasDatabaseUrl: Boolean(directUrlCandidate.value),
    hasDbHost: Boolean(dbFamily.host.value),
    hasDbUser: Boolean(dbFamily.user.value),
    hasDbName: Boolean(dbFamily.database.value),
  };

  const missingVariableNames =
    selectedFamilyName === "none"
      ? [
          "DATABASE_URL",
          "DB_HOST",
          "DB_USER",
          "DB_NAME",
          "MYSQL_HOST",
          "MYSQL_USER",
          "MYSQL_DATABASE",
        ]
      : listMissingFamilyVariables(selectedFamilyName, connection);

  const missingFields = [];
  if (!connection.host) {
    missingFields.push("host");
  }
  if (!connection.user) {
    missingFields.push("user");
  }
  if (!connection.database) {
    missingFields.push("database");
  }

  const bootstrapMeta = getEnvBootstrapMeta();
  const resolutionSource = summarizeResolutionSource(primarySource);

  return {
    client: "mysql2",
    connection: {
      host: connection.host,
      port: normalizePort(connection.port),
      user: connection.user,
      password: connection.password,
      database: connection.database,
      charset: "utf8mb4",
    },
    knexConnection: selectedUrl || {
      host: connection.host,
      port: normalizePort(connection.port),
      user: connection.user,
      password: connection.password,
      database: connection.database,
      charset: "utf8mb4",
    },
    envPresence,
    missingFields,
    missingVariableNames,
    selectedFamilyName,
    resolutionSource,
    bootstrapFilesTried: bootstrapMeta.candidateFiles,
    bootstrapFilesLoaded: bootstrapMeta.loadedFiles,
    bootstrapPathsLoaded: bootstrapMeta.loadedPaths,
  };
}

function buildDbConfigErrorMessage(missingFields = [], missingVariableNames = []) {
  const categorySuffix =
    missingFields.length > 0 ? ` Missing categories: ${missingFields.join(", ")}.` : "";
  const variableSuffix =
    missingVariableNames.length > 0
      ? ` Missing required variables: ${missingVariableNames.join(", ")}.`
      : "";
  return `Database configuration is incomplete.${categorySuffix}${variableSuffix} ${DB_ENV_HELP}`;
}

module.exports = {
  DB_ENV_HELP,
  buildDbConfigErrorMessage,
  pickFirstDefined,
  readConnectionFromDatabaseUrl,
  resolveDbConfig,
};
