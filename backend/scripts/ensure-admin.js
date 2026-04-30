#!/usr/bin/env node
/**
 * Ensure at least one admin user exists (for route audit).
 * Usage: node scripts/ensure-admin.js [email]
 * Default: routeverify@test.com
 */
require('dotenv').config();
const knex = require('knex')({
  client: 'mysql2',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'roots_maghreb',
    charset: 'utf8mb4',
  },
});

async function main() {
  const email = process.argv[2] || 'routeverify@test.com';
  const updated = await knex('users').where({ email }).update({ role_id: 1 });
  const count = await knex('users').where('role_id', 1).count('* as n').first();
  console.log(updated ? `Updated ${email} to admin (${updated} row(s))` : `User ${email} not found`);
  console.log(`Total admins: ${count?.n ?? 0}`);
  await knex.destroy();
}
main().catch((e) => { console.error(e); process.exit(1); });
