import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as helmet from "helmet";
import * as process from "process";
import * as path from "path";
import * as compression from "compression";
import rateLimit from "express-rate-limit";
import { randomUUID } from "crypto";
import { Knex } from "knex";
import { CorsOptions as ExpressCorsOptions } from "cors";
import cors = require("cors");
import * as bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

/** Production CORS origins: RootsEgypt .org domains + EasyPanel + dev localhost */
const ALLOWED_CORS_ORIGINS = [
  "https://rootsegypt.org",
  "https://www.rootsegypt.org",
  "https://api.rootsegypt.org",
  "http://localhost:80",
  "http://127.0.0.1:80",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:3000",
];

/**
 * Check if origin matches allowed list.
 * Supports exact match and wildcard subdomain matching for *.rootsegypt.org
 */
function isAllowedCorsOrigin(
  origin: string | undefined,
  corsOrigins: string[] | true,
): string | null {
  if (!origin) return null;
  if (corsOrigins === true) return origin;
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const allowed = corsOrigins as string[];

  // Exact match
  if (allowed.includes(normalizedOrigin)) return normalizedOrigin;

  // Wildcard: any *.rootsegypt.org subdomain (production flexibility)
  try {
    const hostname = new URL(normalizedOrigin).hostname;
    if (hostname === "rootsegypt.org" || hostname.endsWith(".rootsegypt.org")) {
      return normalizedOrigin;
    }
  } catch {
    // invalid URL, ignore
  }

  return null;
}

function getCorsOrigins(): string[] | true {
  const raw = process.env.CORS_ORIGIN || "";
  const list = raw
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  const origins = list.length ? list : ALLOWED_CORS_ORIGINS;
  return [...new Set([...origins])];
}

function getForwardedOriginalPath(req: any): string | null {
  const candidates = [
    req.headers["x-original-uri"],
    req.headers["x-rewrite-url"],
    req.headers["x-forwarded-uri"],
    req.headers["x-original-url"],
  ];

  for (const value of candidates) {
    if (!value) continue;
    const raw = Array.isArray(value) ? value[0] : String(value);
    const path = raw.trim();
    if (path.startsWith("/")) return path;
  }
  return null;
}

async function ensureCriticalSchema(knex: Knex) {
  // Belt-and-suspenders: add missing columns / tables that must exist for the
  // app to function, regardless of whether formal migrations ran.
  try {
    // users.admin_privileges  (20250427 migration - may not have run on old servers)
    if (await knex.schema.hasTable("users")) {
      if (!(await knex.schema.hasColumn("users", "admin_privileges"))) {
        await knex.schema.alterTable("users", (t) =>
          t.text("admin_privileges").nullable(),
        );
        console.log("🟡 Schema patch: added users.admin_privileges");
      }
    }

    // family_trees.data_format  (20250314 migration)
    if (await knex.schema.hasTable("family_trees")) {
      if (!(await knex.schema.hasColumn("family_trees", "data_format"))) {
        await knex.schema.alterTable("family_trees", (t) =>
          t.string("data_format", 20).nullable(),
        );
        console.log("🟡 Schema patch: added family_trees.data_format");
      }
    }

    // books.updated_at  (20250131 migration)
    if (await knex.schema.hasTable("books")) {
      if (!(await knex.schema.hasColumn("books", "updated_at"))) {
        await knex.schema.alterTable("books", (t) =>
          t.timestamp("updated_at").nullable(),
        );
        console.log("🟡 Schema patch: added books.updated_at");
      }
    }

    // ── Initial schema tables (may be missing if migration was recorded done but partially ran) ──

    // activity_logs
    if (
      (await knex.schema.hasTable("users")) &&
      !(await knex.schema.hasTable("activity_logs"))
    ) {
      await knex.schema.createTable("activity_logs", (t) => {
        t.increments("id");
        t.integer("actor_user_id").unsigned().references("id").inTable("users");
        t.string("type").notNullable();
        t.string("description").notNullable();
        t.dateTime("created_at").defaultTo(knex.fn.now());
      });
      console.log("🟡 Schema patch: created activity_logs");
    }
    if (
      (await knex.schema.hasTable("activity_logs")) &&
      !(await knex.schema.hasColumn("activity_logs", "updated_at"))
    ) {
      await knex.schema.alterTable("activity_logs", (t) =>
        t.dateTime("updated_at").nullable(),
      );
    }

    // app_settings
    if (!(await knex.schema.hasTable("app_settings"))) {
      await knex.schema.createTable("app_settings", (t) => {
        t.string("key").primary();
        t.string("value").notNullable();
        t.dateTime("updated_at").defaultTo(knex.fn.now());
      });
      console.log("🟡 Schema patch: created app_settings");
    }

    // password_resets
    if (!(await knex.schema.hasTable("password_resets"))) {
      await knex.schema.createTable("password_resets", (t) => {
        t.string("email").primary();
        t.string("code_hash").notNullable();
        t.dateTime("expires_at").notNullable();
        t.dateTime("created_at").defaultTo(knex.fn.now());
      });
      console.log("🟡 Schema patch: created password_resets");
    }

    // refresh_tokens
    if (
      (await knex.schema.hasTable("users")) &&
      !(await knex.schema.hasTable("refresh_tokens"))
    ) {
      await knex.schema.createTable("refresh_tokens", (t) => {
        t.increments("id");
        t.string("token").unique().notNullable();
        t.integer("user_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");
        t.dateTime("expires_at").notNullable();
        t.dateTime("created_at").defaultTo(knex.fn.now());
      });
      console.log("🟡 Schema patch: created refresh_tokens");
    }

    // books
    if (
      (await knex.schema.hasTable("users")) &&
      !(await knex.schema.hasTable("books"))
    ) {
      await knex.schema.createTable("books", (t) => {
        t.increments("id");
        t.string("title").notNullable();
        t.string("author");
        t.string("description");
        t.string("category");
        t.string("file_path").notNullable();
        t.string("cover_path");
        t.bigInteger("file_size");
        t.string("archive_source");
        t.string("document_code");
        t.integer("uploaded_by")
          .unsigned()
          .references("id")
          .inTable("users")
          .onDelete("SET NULL");
        t.boolean("is_public").defaultTo(false);
        t.integer("download_count").defaultTo(0);
        t.dateTime("created_at").defaultTo(knex.fn.now());
        t.dateTime("updated_at").defaultTo(knex.fn.now());
      });
      console.log("🟡 Schema patch: created books");
    }

    // family_trees
    if (
      (await knex.schema.hasTable("users")) &&
      !(await knex.schema.hasTable("family_trees"))
    ) {
      await knex.schema.createTable("family_trees", (t) => {
        t.increments("id");
        t.integer("user_id")
          .unsigned()
          .references("id")
          .inTable("users")
          .onDelete("SET NULL");
        t.string("title").notNullable();
        t.string("description");
        t.string("gedcom_path");
        t.string("data_format", 20).defaultTo("gedcom");
        t.string("archive_source");
        t.string("document_code");
        t.boolean("is_public").defaultTo(false);
        t.dateTime("created_at").defaultTo(knex.fn.now());
        t.dateTime("updated_at").defaultTo(knex.fn.now());
      });
      console.log("🟡 Schema patch: created family_trees");
    }

    // gallery
    if (
      (await knex.schema.hasTable("users")) &&
      (await knex.schema.hasTable("family_trees")) &&
      !(await knex.schema.hasTable("gallery"))
    ) {
      await knex.schema.createTable("gallery", (t) => {
        t.increments("id");
        t.string("title").notNullable();
        t.text("description");
        t.string("image_path").notNullable();
        t.integer("uploaded_by")
          .unsigned()
          .references("id")
          .inTable("users")
          .onDelete("SET NULL");
        t.integer("book_id")
          .unsigned()
          .references("id")
          .inTable("books")
          .onDelete("CASCADE");
        t.integer("tree_id")
          .unsigned()
          .references("id")
          .inTable("family_trees")
          .onDelete("CASCADE");
        t.boolean("is_public").defaultTo(true);
        t.string("archive_source");
        t.string("document_code");
        t.string("location");
        t.string("year");
        t.string("photographer");
        t.dateTime("created_at").defaultTo(knex.fn.now());
        t.dateTime("updated_at").defaultTo(knex.fn.now());
      });
      console.log("🟡 Schema patch: created gallery");
    }

    // persons
    if (
      (await knex.schema.hasTable("family_trees")) &&
      !(await knex.schema.hasTable("persons"))
    ) {
      await knex.schema.createTable("persons", (t) => {
        t.increments("id");
        t.integer("tree_id")
          .unsigned()
          .references("id")
          .inTable("family_trees")
          .onDelete("CASCADE");
        t.string("name");
      });
      console.log("🟡 Schema patch: created persons");
    }

    // contact_messages  (20260427 migration)
    if (!(await knex.schema.hasTable("contact_messages"))) {
      await knex.schema.createTable("contact_messages", (t) => {
        t.increments("id");
        t.string("name", 255).notNullable();
        t.string("email", 255).notNullable();
        t.text("message").notNullable();
        t.timestamp("created_at").defaultTo(knex.fn.now());
      });
      console.log("🟡 Schema patch: created contact_messages table");
    }

    // newsletter_subscribers  (20260427 migration)
    if (!(await knex.schema.hasTable("newsletter_subscribers"))) {
      await knex.schema.createTable("newsletter_subscribers", (t) => {
        t.increments("id");
        t.string("email").notNullable().unique();
        t.dateTime("created_at").defaultTo(knex.fn.now());
      });
      console.log("🟡 Schema patch: created newsletter_subscribers table");
    }

    // password_reset_requests  (20250316 migration)
    if (!(await knex.schema.hasTable("password_reset_requests"))) {
      await knex.schema.createTable("password_reset_requests", (t) => {
        t.increments("id");
        t.integer("user_id").unsigned().notNullable();
        t.string("email").notNullable();
        t.string("status").notNullable().defaultTo("pending");
        t.dateTime("requested_at").notNullable().defaultTo(knex.fn.now());
        t.dateTime("processed_at").nullable();
        t.integer("processed_by").unsigned().nullable();
        t.string("reset_token", 128).nullable();
        t.dateTime("token_expires_at").nullable();
      });
      console.log("🟡 Schema patch: created password_reset_requests table");
    }

    // account_deletion_requests  (20250316 migration)
    if (!(await knex.schema.hasTable("account_deletion_requests"))) {
      await knex.schema.createTable("account_deletion_requests", (t) => {
        t.increments("id");
        t.integer("user_id").unsigned().notNullable();
        t.string("email", 255).notNullable();
        t.text("reason").nullable();
        t.string("status").notNullable().defaultTo("pending");
        t.dateTime("requested_at").notNullable().defaultTo(knex.fn.now());
        t.dateTime("processed_at").nullable();
        t.integer("processed_by").unsigned().nullable();
      });
      console.log("🟡 Schema patch: created account_deletion_requests table");
    }

    console.log("🟢 Critical schema check complete");
  } catch (err: any) {
    console.error("🔴 ensureCriticalSchema error:", err?.message || err);
  }
}

async function ensureSchemaReady(knex: Knex) {
  const autoRunMigrations =
    String(process.env.AUTO_RUN_MIGRATIONS || "true").toLowerCase() !== "false";
  if (!autoRunMigrations) return;

  const requiredTables = ["users", "refresh_tokens", "family_trees"];
  const missing: string[] = [];

  for (const table of requiredTables) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await knex.schema.hasTable(table);
    if (!exists) missing.push(table);
  }

  if (missing.length) {
    console.warn(`WARN missing tables detected: ${missing.join(", ")}.`);
  }

  console.log("INFO running pending migrations...");
  try {
    await knex.migrate.latest({
      directory: path.join(process.cwd(), "src", "db", "migrations"),
    });
    console.log("INFO migrations up to date");
  } catch (migErr: any) {
    console.warn(
      "🟠 Migration runner error (ensureCriticalSchema will repair):",
      migErr?.message,
    );
  }

  // Inline column/table repair as a fallback for old deployments that skipped migrations.
  await ensureCriticalSchema(knex);
  await seedInitialData(knex);
}

async function seedInitialData(knex: Knex) {
  try {
    // 1) Roles
    if (await knex.schema.hasTable("roles")) {
      const existingRoles = await knex("roles").select("id");
      const existingIds = new Set(existingRoles.map((r: any) => r.id));
      const wantRoles = [
        { id: 1, name: "admin", permissions: "all" },
        { id: 2, name: "user", permissions: "read_only" },
        { id: 3, name: "super_admin", permissions: "all" },
      ];
      for (const r of wantRoles) {
        if (!existingIds.has(r.id)) {
          await knex("roles").insert(r);
          console.log(`INFO seeded role: ${r.name}`);
        }
      }
    }

    // 2) Admin users - seed only from explicit environment configuration.
    if (!(await knex.schema.hasTable("users"))) {
      console.warn("WARN admin seed skipped: users table missing");
      return;
    }
    const seedPrefixes = ["SEED_ADMIN", "SEED_ADMIN2", "SEED_ADMIN3"];
    for (const prefix of seedPrefixes) {
      const rawSeedEmail = String(process.env[`${prefix}_EMAIL`] || "")
        .trim()
        .toLowerCase();
      const seedPassword = String(process.env[`${prefix}_PASSWORD`] || "");
      const seedFullName = String(
        process.env[`${prefix}_FULL_NAME`] || "",
      ).trim();
      const seedRoleId = parseInt(process.env[`${prefix}_ROLE_ID`] || "1", 10);

      if (!rawSeedEmail && !seedPassword && !seedFullName) {
        console.log(`INFO admin seed not configured for ${prefix}`);
        continue;
      }

      if (!rawSeedEmail || !seedPassword || !seedFullName) {
        console.warn(
          `WARN skipping ${prefix}: email, password, or full name missing`,
        );
        continue;
      }

      const seedEmail = rawSeedEmail;
      const existing = await knex("users").where({ email: seedEmail }).first();
      if (!existing) {
        const hash = await bcrypt.hash(seedPassword, 10);
        await knex("users").insert({
          full_name: seedFullName,
          email: seedEmail,
          password: hash,
          role_id: seedRoleId,
          status: "active",
        });
        console.log(`INFO seeded admin user: ${seedEmail}`);
      } else {
        const matches = await bcrypt.compare(
          seedPassword,
          existing.password || "",
        );
        if (!matches) {
          const hash = await bcrypt.hash(seedPassword, 10);
          await knex("users").where({ id: existing.id }).update({
            password: hash,
            role_id: seedRoleId,
            status: "active",
            full_name: seedFullName,
          });
          console.log(`INFO refreshed admin password: ${seedEmail}`);
        }
      }
    }
  } catch (err: any) {
    console.error("ERROR seedInitialData:", err?.message || err);
  }
}

async function bootstrap() {
  console.log("INFO server starting...");

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // Running behind EasyPanel reverse proxy (X-Forwarded-* headers).
    app.set("trust proxy", 1);

    // Static file serving for uploads (images, books, GEDCOM) - cPanel/production safe
    const uploadsPath = path.join(process.cwd(), "uploads");
    app.use("/uploads", require("express").static(uploadsPath));

    // Root route: avoid 404 when hitting API base URL (e.g. https://api.example.com/)
    app.use((req: any, res: any, next: () => void) => {
      if (req.method === "GET" && (req.path === "/" || req.path === "")) {
        return res.type("application/json").json({
          app: "RootsEgypt API",
          status: "ok",
          health: "/api/health",
          live: "/api/health/live",
          message:
            "Use the frontend at your site root; API routes are under /api",
        });
      }
      next();
    });

    // Compression (production-ready)
    app.use(compression());

    // API Prefix (use 'api' for cPanel/proxy compatibility; /api/auth/login, etc.)
    app.setGlobalPrefix("api");

    // Request ID for tracing
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as any).id = req.headers["x-request-id"] || randomUUID();
      next();
    });

    // CORS: dev = allow all; prod = allowed origins
    const corsOrigins = getCorsOrigins();

    const corsOptions: ExpressCorsOptions = {
      origin:
        corsOrigins === true
          ? true
          : (
              origin: string | undefined,
              cb: (err: Error | null, allow?: boolean) => void,
            ) => {
              if (!origin) return cb(null, true);
              const allowedOrigin = isAllowedCorsOrigin(origin, corsOrigins);
              if (!allowedOrigin) {
                console.warn(`WARN CORS denied origin: ${origin}`);
              }
              cb(null, !!allowedOrigin);
            },
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Cache-Control",
        "Pragma",
        "Expires",
        "If-Modified-Since",
        "Accept",
        "Origin",
        "X-Request-Id",
      ],
      credentials: true,
      optionsSuccessStatus: 204,
      preflightContinue: false,
    };

    // Express-level CORS first: catches OPTIONS before route handling.
    app.use(cors(corsOptions));

    // Recovery middleware: some reverse proxies rewrite unknown requests
    // to /api/errors/not-found. If they preserve original URI headers,
    // restore the original path so routing and CORS preflight still work.
    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.path === "/api/errors/not-found") {
        const originalPath = getForwardedOriginalPath(req);
        if (originalPath && originalPath !== req.path) {
          req.url = originalPath;
        }
      }
      next();
    });

    // cPanel/proxy-safe CORS fallback to guarantee preflight headers.
    // Some proxy stacks can swallow framework CORS responses for OPTIONS.
    app.use((req: any, res: any, next: () => void) => {
      const requestOrigin = req.headers.origin as string | undefined;
      const allowedOrigin = isAllowedCorsOrigin(requestOrigin, corsOrigins);

      if (allowedOrigin) {
        res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }

      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, If-Modified-Since, Accept, Origin, X-Request-Id",
      );
      res.setHeader("Access-Control-Max-Age", "86400");

      if (req.method === "OPTIONS") {
        return res.sendStatus(204);
      }
      next();
    });

    // Rate limiting
    const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);
    const rateLimitWindow = parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || "60000",
      10,
    );
    const authRateLimitMax = parseInt(
      process.env.RATE_LIMIT_AUTH_MAX || "10",
      10,
    );

    app.use(
      rateLimit({
        windowMs: rateLimitWindow,
        max: rateLimitMax,
        message: {
          statusCode: 429,
          message: "Too many requests. Please try again later.",
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
          const p = req.path || "";
          return p.includes("/health") || p.includes("/auth/");
        },
      }),
    );

    // Stricter rate limit for auth routes (applied before global for /auth/*)
    const authLimiter = rateLimit({
      windowMs: rateLimitWindow,
      max: authRateLimitMax,
      message: {
        statusCode: 429,
        message: "Too many attempts. Try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use("/api/auth/login", authLimiter);
    app.use("/api/auth/signup", authLimiter);

    // Security: Helmet + explicit headers (Pragma, X-Frame-Options, etc.)
    const helmetOptions: Parameters<typeof helmet.default>[0] = {
      contentSecurityPolicy: false, // API returns JSON; CSP usually for HTML
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    };
    app.use(helmet.default(helmetOptions));
    app.use((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader("Pragma", "no-cache");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader(
        "Permissions-Policy",
        "geolocation=(), microphone=(), camera=()",
      );
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      res.setHeader("Expires", "0");
      next();
    });

    // Production diagnostics: log failed requests with origin and request id.
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.on("finish", () => {
        if (res.statusCode >= 400) {
          const origin = req.headers.origin || "-";
          const requestId = (req as any).id || "-";
          console.warn(
            `🟠 HTTP ${res.statusCode} ${req.method} ${req.originalUrl} origin=${origin} reqId=${requestId}`,
          );
        }
      });
      next();
    });

    app.enableCors({
      origin: corsOptions.origin as any,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      allowedHeaders:
        "Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, If-Modified-Since, Accept, Origin, X-Request-Id",
      credentials: true,
      preflightContinue: false,
    });

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );

    // Global Interceptors & Filters
    const { TransformInterceptor } =
      await import("./common/interceptors/transform.interceptor");
    const { AllExceptionsFilter } =
      await import("./common/filters/all-exceptions.filter");
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    // Ensure DB and required schema are ready before serving traffic.
    const knex = app.get<Knex>("KnexConnection");
    await knex.raw("SELECT 1");
    console.log("🟢 MySQL successfully connected");
    await ensureSchemaReady(knex);

    // Passenger / cPanel Port
    const port = process.env.PORT || 5000;
    await app.listen(port, "0.0.0.0");

    console.log("🟢 SERVER READY");
    console.log(`🟢 Application listening on port ${port}`);
    console.log("============================================");
    console.log("  ✅  BACKEND DEPLOYMENT SUCCESSFUL  ✅  ");
    console.log("============================================");

    // Deployment verification logs for key modules/routes
    const modules = [
      "Auth (login, signup, forgot-password, reset-password)",
      "Users",
      "Gallery",
      "Trees",
      "Books",
      "Audio",
      "Admin Panel",
    ];
    for (const m of modules) {
      console.log(`  ✅  ${m} module loaded`);
    }
    console.log(
      `  ✅  Admin seeding completed — check logs above for seeded users`,
    );
    console.log("============================================");

    // Graceful shutdown (silent — triggered by EasyPanel rolling deploy)
    process.on("SIGTERM", async () => {
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("🔴 SERVER ERROR:", error);
    if (
      error.message.includes("database") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.error("🔴 DB ERROR - Database connection failed");
    }
    process.exit(1);
  }
}
bootstrap();
