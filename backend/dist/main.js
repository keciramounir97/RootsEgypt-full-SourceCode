"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const helmet = require("helmet");
const process = require("process");
const path = require("path");
const compression = require("compression");
const express_rate_limit_1 = require("express-rate-limit");
const crypto_1 = require("crypto");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const ALLOWED_CORS_ORIGINS = [
    "https://rootsegypt.org",
    "https://www.rootsegypt.org",
    "http://rootsegypt.org",
    "http://www.rootsegypt.org",
    "https://api.rootsegypt.org",
    "https://backend.rootsegypt.org",
    "https://frontend-rootsegypt.easypanel.host",
    "https://backend-rootsegypt.easypanel.host",
    "http://localhost:80",
    "http://127.0.0.1:80",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:3000",
];
function isAllowedCorsOrigin(origin, corsOrigins) {
    if (!origin)
        return null;
    if (corsOrigins === true)
        return origin;
    const normalizedOrigin = origin.replace(/\/+$/, "");
    const allowed = corsOrigins;
    if (allowed.includes(normalizedOrigin))
        return normalizedOrigin;
    try {
        const hostname = new URL(normalizedOrigin).hostname;
        if (hostname === "rootsegypt.org" || hostname.endsWith(".rootsegypt.org")) {
            return normalizedOrigin;
        }
        if (hostname.endsWith(".easypanel.host")) {
            return normalizedOrigin;
        }
    }
    catch (_a) {
    }
    return null;
}
function getCorsOrigins() {
    const raw = process.env.CORS_ORIGIN || "";
    const list = raw
        .split(",")
        .map((o) => o.trim().replace(/\/+$/, ""))
        .filter(Boolean);
    const origins = list.length ? list : ALLOWED_CORS_ORIGINS;
    return [...new Set([...origins])];
}
function getForwardedOriginalPath(req) {
    const candidates = [
        req.headers["x-original-uri"],
        req.headers["x-rewrite-url"],
        req.headers["x-forwarded-uri"],
        req.headers["x-original-url"],
    ];
    for (const value of candidates) {
        if (!value)
            continue;
        const raw = Array.isArray(value) ? value[0] : String(value);
        const path = raw.trim();
        if (path.startsWith("/"))
            return path;
    }
    return null;
}
async function ensureCriticalSchema(knex) {
    try {
        if (await knex.schema.hasTable("users")) {
            if (!(await knex.schema.hasColumn("users", "admin_privileges"))) {
                await knex.schema.alterTable("users", (t) => t.text("admin_privileges").nullable());
                console.log("🟡 Schema patch: added users.admin_privileges");
            }
        }
        if (await knex.schema.hasTable("family_trees")) {
            if (!(await knex.schema.hasColumn("family_trees", "data_format"))) {
                await knex.schema.alterTable("family_trees", (t) => t.string("data_format", 20).nullable());
                console.log("🟡 Schema patch: added family_trees.data_format");
            }
        }
        if (await knex.schema.hasTable("books")) {
            if (!(await knex.schema.hasColumn("books", "updated_at"))) {
                await knex.schema.alterTable("books", (t) => t.timestamp("updated_at").nullable());
                console.log("🟡 Schema patch: added books.updated_at");
            }
        }
        if ((await knex.schema.hasTable("users")) &&
            !(await knex.schema.hasTable("activity_logs"))) {
            await knex.schema.createTable("activity_logs", (t) => {
                t.increments("id");
                t.integer("actor_user_id").unsigned().references("id").inTable("users");
                t.string("type").notNullable();
                t.string("description").notNullable();
                t.dateTime("created_at").defaultTo(knex.fn.now());
            });
            console.log("🟡 Schema patch: created activity_logs");
        }
        if ((await knex.schema.hasTable("activity_logs")) &&
            !(await knex.schema.hasColumn("activity_logs", "updated_at"))) {
            await knex.schema.alterTable("activity_logs", (t) => t.dateTime("updated_at").nullable());
        }
        if (!(await knex.schema.hasTable("app_settings"))) {
            await knex.schema.createTable("app_settings", (t) => {
                t.string("key").primary();
                t.string("value").notNullable();
                t.dateTime("updated_at").defaultTo(knex.fn.now());
            });
            console.log("🟡 Schema patch: created app_settings");
        }
        if (!(await knex.schema.hasTable("password_resets"))) {
            await knex.schema.createTable("password_resets", (t) => {
                t.string("email").primary();
                t.string("code_hash").notNullable();
                t.dateTime("expires_at").notNullable();
                t.dateTime("created_at").defaultTo(knex.fn.now());
            });
            console.log("🟡 Schema patch: created password_resets");
        }
        if ((await knex.schema.hasTable("users")) &&
            !(await knex.schema.hasTable("refresh_tokens"))) {
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
        if ((await knex.schema.hasTable("users")) &&
            !(await knex.schema.hasTable("books"))) {
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
        if ((await knex.schema.hasTable("users")) &&
            !(await knex.schema.hasTable("family_trees"))) {
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
        if ((await knex.schema.hasTable("users")) &&
            (await knex.schema.hasTable("family_trees")) &&
            !(await knex.schema.hasTable("gallery"))) {
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
        if ((await knex.schema.hasTable("family_trees")) &&
            !(await knex.schema.hasTable("persons"))) {
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
        if (!(await knex.schema.hasTable("newsletter_subscribers"))) {
            await knex.schema.createTable("newsletter_subscribers", (t) => {
                t.increments("id");
                t.string("email").notNullable().unique();
                t.dateTime("created_at").defaultTo(knex.fn.now());
            });
            console.log("🟡 Schema patch: created newsletter_subscribers table");
        }
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
    }
    catch (err) {
        console.error("🔴 ensureCriticalSchema error:", (err === null || err === void 0 ? void 0 : err.message) || err);
    }
}
async function ensureSchemaReady(knex) {
    const autoRunMigrations = String(process.env.AUTO_RUN_MIGRATIONS || "true").toLowerCase() !== "false";
    if (!autoRunMigrations)
        return;
    const requiredTables = ["users", "refresh_tokens", "family_trees"];
    const missing = [];
    for (const table of requiredTables) {
        const exists = await knex.schema.hasTable(table);
        if (!exists)
            missing.push(table);
    }
    if (missing.length) {
        console.warn(`🟠 Missing tables detected: ${missing.join(", ")}.`);
    }
    console.log("🟡 Running pending migrations...");
    try {
        await knex.migrate.latest({
            directory: path.join(process.cwd(), "src", "db", "migrations"),
        });
        console.log("🟢 Migrations up to date");
    }
    catch (migErr) {
        console.warn("🟠 Migration runner error (ensureCriticalSchema will repair):", migErr === null || migErr === void 0 ? void 0 : migErr.message);
    }
    await ensureCriticalSchema(knex);
    await seedInitialData(knex);
}
async function seedInitialData(knex) {
    try {
        if (await knex.schema.hasTable("roles")) {
            const existingRoles = await knex("roles").select("id");
            const existingIds = new Set(existingRoles.map((r) => r.id));
            const wantRoles = [
                { id: 1, name: "admin", permissions: "all" },
                { id: 2, name: "user", permissions: "read_only" },
                { id: 3, name: "super_admin", permissions: "all" },
            ];
            for (const r of wantRoles) {
                if (!existingIds.has(r.id)) {
                    await knex("roles").insert(r);
                    console.log(`🟡 Seeded role: ${r.name}`);
                }
            }
        }
        if (!(await knex.schema.hasTable("users"))) {
            console.warn("🟠 Skipping admin seed: users table missing");
            return;
        }
        const adminDefaults = {
            SEED_ADMIN: {
                email: "karimadmin@rootsegypt.org",
                password: "admin2025$",
                fullName: "Karim Admin",
                roleId: 1,
            },
            SEED_ADMIN2: {
                email: "kameladmin@rootsegypt.org",
                password: "vivreplusfort18041972SS",
                fullName: "Kamel Admin",
                roleId: 1,
            },
            SEED_ADMIN3: {
                email: "devteam@rootsegypt.org",
                password: "admin2025$",
                fullName: "Dev Team Admin",
                roleId: 1,
            },
        };
        for (const prefix of Object.keys(adminDefaults)) {
            const def = adminDefaults[prefix];
            const seedEmail = (process.env[`${prefix}_EMAIL`] || def.email)
                .trim()
                .toLowerCase();
            const seedPassword = process.env[`${prefix}_PASSWORD`] || def.password;
            const seedFullName = process.env[`${prefix}_FULL_NAME`] || def.fullName;
            const seedRoleId = parseInt(process.env[`${prefix}_ROLE_ID`] || String(def.roleId), 10);
            if (!seedEmail || !seedPassword) {
                console.warn(`🟠 Skipping ${prefix}: email or password missing`);
                continue;
            }
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
                console.log(`🟢 Seeded admin user: ${seedEmail}`);
            }
            else {
                const matches = await bcrypt.compare(seedPassword, existing.password || "");
                if (!matches) {
                    const hash = await bcrypt.hash(seedPassword, 10);
                    await knex("users").where({ id: existing.id }).update({
                        password: hash,
                        role_id: seedRoleId,
                        status: "active",
                        full_name: seedFullName,
                    });
                    console.log(`🟡 Refreshed admin password: ${seedEmail}`);
                }
            }
        }
    }
    catch (err) {
        console.error("🔴 seedInitialData error:", (err === null || err === void 0 ? void 0 : err.message) || err);
    }
}
async function bootstrap() {
    console.log("🟢 SERVER STARTING...");
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.set("trust proxy", 1);
        const uploadsPath = path.join(process.cwd(), "uploads");
        app.use("/uploads", require("express").static(uploadsPath));
        app.use((req, res, next) => {
            if (req.method === "GET" && (req.path === "/" || req.path === "")) {
                return res.type("application/json").json({
                    app: "RootsEgypt API",
                    status: "ok",
                    health: "/api/health",
                    live: "/api/health/live",
                    message: "Use the frontend at your site root; API routes are under /api",
                });
            }
            next();
        });
        app.use(compression());
        app.setGlobalPrefix("api");
        app.use((req, _res, next) => {
            req.id = req.headers["x-request-id"] || (0, crypto_1.randomUUID)();
            next();
        });
        const corsOrigins = getCorsOrigins();
        const corsOptions = {
            origin: corsOrigins === true
                ? true
                : (origin, cb) => {
                    if (!origin)
                        return cb(null, true);
                    const allowedOrigin = isAllowedCorsOrigin(origin, corsOrigins);
                    if (!allowedOrigin) {
                        console.warn(`🟠 CORS denied origin: ${origin}`);
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
        app.use(cors(corsOptions));
        app.use((req, _res, next) => {
            if (req.path === "/api/errors/not-found") {
                const originalPath = getForwardedOriginalPath(req);
                if (originalPath && originalPath !== req.path) {
                    req.url = originalPath;
                }
            }
            next();
        });
        app.use((req, res, next) => {
            const requestOrigin = req.headers.origin;
            const allowedOrigin = isAllowedCorsOrigin(requestOrigin, corsOrigins);
            if (allowedOrigin) {
                res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
                res.setHeader("Vary", "Origin");
                res.setHeader("Access-Control-Allow-Credentials", "true");
            }
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, If-Modified-Since, Accept, Origin, X-Request-Id");
            res.setHeader("Access-Control-Max-Age", "86400");
            if (req.method === "OPTIONS") {
                return res.sendStatus(204);
            }
            next();
        });
        const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);
        const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);
        const authRateLimitMax = parseInt(process.env.RATE_LIMIT_AUTH_MAX || "10", 10);
        app.use((0, express_rate_limit_1.default)({
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
        }));
        const authLimiter = (0, express_rate_limit_1.default)({
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
        const helmetOptions = {
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: { policy: "cross-origin" },
        };
        app.use(helmet.default(helmetOptions));
        app.use((_req, res, next) => {
            res.setHeader("Pragma", "no-cache");
            res.setHeader("X-Frame-Options", "DENY");
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            res.setHeader("X-XSS-Protection", "1; mode=block");
            res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Expires", "0");
            next();
        });
        app.use((req, res, next) => {
            res.on("finish", () => {
                if (res.statusCode >= 400) {
                    const origin = req.headers.origin || "-";
                    const requestId = req.id || "-";
                    console.warn(`🟠 HTTP ${res.statusCode} ${req.method} ${req.originalUrl} origin=${origin} reqId=${requestId}`);
                }
            });
            next();
        });
        app.enableCors({
            origin: corsOptions.origin,
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
            allowedHeaders: "Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, If-Modified-Since, Accept, Origin, X-Request-Id",
            credentials: true,
            preflightContinue: false,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }));
        const { TransformInterceptor } = await Promise.resolve().then(() => require("./common/interceptors/transform.interceptor"));
        const { AllExceptionsFilter } = await Promise.resolve().then(() => require("./common/filters/all-exceptions.filter"));
        app.useGlobalInterceptors(new TransformInterceptor());
        app.useGlobalFilters(new AllExceptionsFilter());
        const knex = app.get("KnexConnection");
        await knex.raw("SELECT 1");
        console.log("🟢 MySQL successfully connected");
        await ensureSchemaReady(knex);
        const port = process.env.PORT || 5000;
        await app.listen(port, "0.0.0.0");
        console.log("🟢 SERVER READY");
        console.log(`🟢 Application listening on port ${port}`);
        console.log("============================================");
        console.log("  ✅  BACKEND DEPLOYMENT SUCCESSFUL  ✅  ");
        console.log("============================================");
        process.on("SIGTERM", async () => {
            await app.close();
            process.exit(0);
        });
    }
    catch (error) {
        console.error("🔴 SERVER ERROR:", error);
        if (error.message.includes("database") ||
            error.message.includes("ECONNREFUSED")) {
            console.error("🔴 DB ERROR - Database connection failed");
        }
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map