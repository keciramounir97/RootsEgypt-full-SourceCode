import {
  All,
  Controller,
  Get,
  ForbiddenException,
  HttpCode,
  Options,
  Req,
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Knex } from "knex";
import { User } from "../../models/User";
import { Request } from "express";

@Controller()
export class HealthController {
  constructor(@Inject("KnexConnection") private readonly knex: Knex) {}

  private apiInfo() {
    return {
      app: "RootsEgypt API",
      ok: true,
      status: "healthy",
      color: "green",
      health: "/api/health",
      live: "/api/health/live",
      db: "/api/db-health",
      routes: "/api/routes",
      message:
        "API routes are available under /api. If this appears for /api/errors/not-found, check reverse proxy path forwarding.",
    };
  }

  @Get()
  root() {
    return this.apiInfo();
  }

  @Get("routes")
  routes() {
    return {
      ok: true,
      routes: {
        health: ["/api", "/api/health", "/api/health/live", "/health/live"],
        auth: [
          "/api/login",
          "/api/signup",
          "/api/me",
          "/api/refresh",
          "/api/logout",
          "/api/reset",
          "/api/reset/verify",
          "/api/reset/token",
          "/api/auth/login",
          "/api/auth/signup",
          "/api/auth/me",
          "/api/auth/refresh",
          "/api/auth/logout",
          "/api/auth/reset",
          "/api/auth/reset/verify",
          "/api/auth/reset/token",
        ],
        public: [
          "/api/trees",
          "/api/books",
          "/api/gallery",
          "/api/search",
          "/api/search/suggest",
          "/api/contact",
          "/api/newsletter/subscribe",
        ],
        user: ["/api/my/trees", "/api/my/books", "/api/my/gallery"],
        admin: [
          "/api/admin/users",
          "/api/admin/admins",
          "/api/admin/trees",
          "/api/admin/books",
          "/api/admin/gallery",
          "/api/admin/stats",
          "/api/admin/contact/messages",
          "/api/admin/newsletter/subscribers",
          "/api/admin/approvals/stats",
        ],
      },
    };
  }

  @Get("health/live")
  live() {
    return {
      ok: true,
      status: "healthy",
      color: "green",
      database: "not_checked",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "1.0.0",
    };
  }

  @Get("health")
  async ready() {
    try {
      // Test database connectivity
      await this.knex.raw("SELECT 1");

      return {
        ok: true,
        status: "healthy",
        color: "green",
        timestamp: new Date().toISOString(),
        database: "connected",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || "1.0.0",
      };
    } catch (error: any) {
      return {
        ok: false,
        status: "unhealthy",
        color: "red",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error?.message || "database unavailable",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };
    }
  }

  @Get("db-health")
  async dbHealth() {
    try {
      await this.knex.raw("SELECT 1");
      return {
        ok: true,
        status: "healthy",
        color: "green",
        database: "connected",
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        ok: false,
        status: "unhealthy",
        color: "red",
        database: "disconnected",
        error: error?.message || "database unavailable",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Options("errors/not-found")
  @HttpCode(204)
  proxyFallbackPreflight() {
    return undefined;
  }

  @All("errors/not-found")
  @HttpCode(200)
  proxyFallback(@Req() req: Request) {
    return {
      ...this.apiInfo(),
      ok: false,
      status: "proxy_rewrite_not_found",
      method: req.method,
      path: req.originalUrl || req.url,
      message:
        "The backend received /api/errors/not-found. Configure the reverse proxy to forward the original API path, or pass X-Original-Uri/X-Rewrite-Url/X-Forwarded-Uri so the backend can restore it.",
    };
  }

  @Get("health/db-diag")
  async dbDiag() {
    // Only available in development — exposes schema details
    if (process.env.NODE_ENV === "production") {
      throw new ForbiddenException(
        "Diagnostic endpoint not available in production",
      );
    }

    const result: Record<string, any> = { timestamp: new Date().toISOString() };

    // 1. Raw knex
    try {
      const [rows] = await this.knex.raw("SELECT COUNT(*) as cnt FROM users");
      result.rawKnex = { ok: true, userCount: rows[0]?.cnt };
    } catch (e: any) {
      result.rawKnex = { ok: false, error: e?.message };
    }

    // 2. Objection.js Model.query
    try {
      const count = (await User.query(this.knex)
        .count("id as cnt")
        .first()) as any;
      result.objectionQuery = { ok: true, userCount: count?.cnt };
    } catch (e: any) {
      result.objectionQuery = { ok: false, error: e?.message };
    }

    // 3. Column existence checks
    try {
      const checks = {
        users_admin_privileges: await this.knex.schema.hasColumn(
          "users",
          "admin_privileges",
        ),
        family_trees_data_format: await this.knex.schema.hasColumn(
          "family_trees",
          "data_format",
        ),
        contact_messages: await this.knex.schema.hasTable("contact_messages"),
        newsletter_subscribers: await this.knex.schema.hasTable(
          "newsletter_subscribers",
        ),
        password_reset_requests: await this.knex.schema.hasTable(
          "password_reset_requests",
        ),
        account_deletion_requests: await this.knex.schema.hasTable(
          "account_deletion_requests",
        ),
      };
      result.schemaChecks = checks;
    } catch (e: any) {
      result.schemaChecks = { error: e?.message };
    }

    return result;
  }
}
