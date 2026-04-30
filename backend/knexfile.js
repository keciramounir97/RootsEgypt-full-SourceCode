require("dotenv").config();

const readConnectionFromDatabaseUrl = (databaseUrl) => {
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
};

const pickFirstDefined = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return undefined;
};

const fromUrl = readConnectionFromDatabaseUrl(process.env.DATABASE_URL);

module.exports = {
  client: "mysql2",
  connection: {
    host: pickFirstDefined(
      process.env.DB_HOST,
      process.env.MYSQL_HOST,
      process.env.MYSQLHOST,
      fromUrl.host,
    ),
    port: Number(
      pickFirstDefined(
        process.env.DB_PORT,
        process.env.MYSQL_PORT,
        fromUrl.port,
        3306,
      ),
    ),
    user: pickFirstDefined(
      process.env.DB_USER,
      process.env.MYSQL_USER,
      process.env.MYSQLUSER,
      fromUrl.user,
    ),
    password: pickFirstDefined(
      process.env.DB_PASSWORD,
      process.env.MYSQL_PASSWORD,
      process.env.MYSQLPASSWORD,
      fromUrl.password,
    ),
    database: pickFirstDefined(
      process.env.DB_NAME,
      process.env.DB_DATABASE,
      process.env.MYSQL_DATABASE,
      process.env.MYSQLDATABASE,
      fromUrl.database,
    ),
    charset: "utf8mb4",
  },
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  migrations: {
    directory: "./src/db/migrations",
    extension: process.env.NODE_ENV === "production" ? "js" : "ts",
  },
  seeds: {
    directory: "./src/db/seeds",
  },
};
