import {
  Controller,
  Get,
  ServiceUnavailableException,
  ForbiddenException,
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Knex } from "knex";
import { User } from "../../models/User";

@Controller()
export class HealthController {
  constructor(@Inject("KnexConnection") private readonly knex: Knex) {}

  @Get("health/live")
  live() {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
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
        status: "ready",
        timestamp: new Date().toISOString(),
        database: "connected",
        uptime: process.uptime(),
        version: process.env.npm_package_version || "1.0.0",
      };
    } catch (error: any) {
      throw new ServiceUnavailableException({
        ok: false,
        status: "not_ready",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error?.message || "database unavailable",
        uptime: process.uptime(),
      });
    }
  }

  @Get("db-health")
  async dbHealth() {
    try {
      await this.knex.raw("SELECT 1");
      return {
        ok: true,
        database: "connected",
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new ServiceUnavailableException({
        ok: false,
        database: "disconnected",
        error: error?.message || "database unavailable",
        timestamp: new Date().toISOString(),
      });
    }
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
