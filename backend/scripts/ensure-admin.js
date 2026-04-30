#!/usr/bin/env node
/**
 * Ensure at least one admin user exists (for route audit).
 * Usage: node scripts/ensure-admin.js [email]
 * Default: routeverify@test.com
 */
const { bootstrapEnv } = require("../env-bootstrap");
const { buildDbConfigErrorMessage, resolveDbConfig } = require("../db-config");

bootstrapEnv();

const resolved = resolveDbConfig(undefined, process.env);
if (resolved.missingFields.length > 0) {
  throw new Error(buildDbConfigErrorMessage(resolved.missingFields));
}

const knex = require("knex")({
  client: "mysql2",
  connection: resolved.connection,
});

async function main() {
  const email = process.argv[2] || "routeverify@test.com";
  const updated = await knex("users").where({ email }).update({ role_id: 1 });
  const count = await knex("users").where("role_id", 1).count("* as n").first();
  console.log(
    updated
      ? `Updated ${email} to admin (${updated} row(s))`
      : `User ${email} not found`,
  );
  console.log(`Total admins: ${count?.n ?? 0}`);
  await knex.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
