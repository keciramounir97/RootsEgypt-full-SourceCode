#!/usr/bin/env node
/**
 * Add updated_at to books (one-time fix for BaseModel compatibility)
 * Run: node scripts/add-books-updated-at.js
 */
"use strict";

const { bootstrapEnv } = require("../env-bootstrap");
const { buildDbConfigErrorMessage, resolveDbConfig } = require("../db-config");

bootstrapEnv();

const resolved = resolveDbConfig(undefined, process.env);
if (resolved.missingFields.length > 0) {
  throw new Error(
    buildDbConfigErrorMessage(resolved.missingFields, resolved.missingVariableNames),
  );
}

const knex = require("knex")({
  client: "mysql2",
  connection: resolved.connection,
});

async function main() {
  try {
    const hasColumn = await knex.schema.hasColumn("books", "updated_at");
    if (!hasColumn) {
      await knex.schema.alterTable("books", (table) => {
        table.dateTime("updated_at").defaultTo(knex.fn.now());
      });
      console.log("Added updated_at to books");
    } else {
      console.log("books.updated_at already exists");
    }
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await knex.destroy();
  }
}

main();
