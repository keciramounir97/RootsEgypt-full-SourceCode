#!/usr/bin/env node
/**
 * Add updated_at to books (one-time fix for BaseModel compatibility)
 * Run: node scripts/add-books-updated-at.js
 */
require('dotenv').config();
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  },
});

async function main() {
  try {
    const hasColumn = await knex.schema.hasColumn('books', 'updated_at');
    if (!hasColumn) {
      await knex.schema.alterTable('books', (table) => {
        table.dateTime('updated_at').defaultTo(knex.fn.now());
      });
      console.log('Added updated_at to books');
    } else {
      console.log('books.updated_at already exists');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await knex.destroy();
  }
}
main();
