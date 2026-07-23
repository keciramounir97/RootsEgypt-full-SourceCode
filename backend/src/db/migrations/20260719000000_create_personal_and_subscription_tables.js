const addTimestamps = (knex, table) => {
  table.dateTime("created_at").defaultTo(knex.fn.now());
  table.dateTime("updated_at").defaultTo(knex.fn.now());
};

const userRef = (table) =>
  table
    .integer("user_id")
    .unsigned()
    .notNullable()
    .references("id")
    .inTable("users")
    .onDelete("CASCADE");

exports.up = async function (knex) {
  if (!(await knex.schema.hasTable("user_notes"))) {
    await knex.schema.createTable("user_notes", (table) => {
      table.increments("id").primary();
      userRef(table);
      table.string("title", 255).notNullable();
      table.text("content").nullable();
      addTimestamps(knex, table);
      table.index(["user_id", "updated_at"]);
    });
  }

  if (!(await knex.schema.hasTable("user_tasks"))) {
    await knex.schema.createTable("user_tasks", (table) => {
      table.increments("id").primary();
      userRef(table);
      table.string("title", 255).notNullable();
      table.text("description").nullable();
      table.string("status", 20).notNullable().defaultTo("todo");
      table.string("priority", 20).notNullable().defaultTo("medium");
      table.string("due_date", 20).nullable();
      addTimestamps(knex, table);
      table.index(["user_id", "status"]);
    });
  }

  if (!(await knex.schema.hasTable("user_reminders"))) {
    await knex.schema.createTable("user_reminders", (table) => {
      table.increments("id").primary();
      userRef(table);
      table.string("title", 255).notNullable();
      table.string("reminder_date", 20).notNullable();
      table.string("reminder_time", 10).nullable();
      table.string("type", 20).notNullable().defaultTo("custom");
      addTimestamps(knex, table);
      table.index(["user_id", "reminder_date"]);
    });
  }

  if (!(await knex.schema.hasTable("admin_notes"))) {
    await knex.schema.createTable("admin_notes", (table) => {
      table.increments("id").primary();
      table
        .integer("admin_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table.string("title", 255).notNullable();
      table.text("content").nullable();
      table.string("image_url", 500).nullable();
      addTimestamps(knex, table);
    });
  }

  if (!(await knex.schema.hasTable("admin_tasks"))) {
    await knex.schema.createTable("admin_tasks", (table) => {
      table.increments("id").primary();
      table
        .integer("admin_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table.string("title", 255).notNullable();
      table.text("description").nullable();
      table.string("status", 20).notNullable().defaultTo("todo");
      table.string("image_url", 500).nullable();
      addTimestamps(knex, table);
    });
  }

  if (!(await knex.schema.hasTable("subscription_tiers"))) {
    await knex.schema.createTable("subscription_tiers", (table) => {
      table.increments("id").primary();
      table.string("slug", 50).notNullable().unique();
      table.string("name", 100).notNullable();
      table.decimal("price", 10, 2).notNullable().defaultTo(0);
      table.integer("trial_days").unsigned().notNullable().defaultTo(0);
      table.integer("sort").unsigned().notNullable().defaultTo(0);
      addTimestamps(knex, table);
    });
  }

  const tierCount = await knex("subscription_tiers").count("id as n").first();
  if (!Number(tierCount?.n || 0)) {
    await knex("subscription_tiers").insert([
      { slug: "basic", name: "Basic", price: 0, trial_days: 0, sort: 1 },
      { slug: "premium", name: "Premium", price: 9.99, trial_days: 14, sort: 2 },
      { slug: "pro", name: "Family Historian", price: 19.99, trial_days: 14, sort: 3 },
    ]);
  }

  if (!(await knex.schema.hasTable("user_subscriptions"))) {
    await knex.schema.createTable("user_subscriptions", (table) => {
      table.increments("id").primary();
      userRef(table);
      table
        .integer("tier_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("subscription_tiers")
        .onDelete("CASCADE");
      table.string("status", 20).notNullable().defaultTo("active");
      table.dateTime("started_at").defaultTo(knex.fn.now());
      table.dateTime("expires_at").nullable();
      addTimestamps(knex, table);
      table.index(["user_id", "status"]);
    });
  }

  if (!(await knex.schema.hasTable("subscription_payments"))) {
    await knex.schema.createTable("subscription_payments", (table) => {
      table.increments("id").primary();
      userRef(table);
      table
        .integer("tier_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("subscription_tiers")
        .onDelete("CASCADE");
      table.decimal("amount", 10, 2).notNullable().defaultTo(0);
      table.string("currency", 8).notNullable().defaultTo("USD");
      table.string("proof_url", 500).nullable();
      table.text("notes").nullable();
      table.string("status", 20).notNullable().defaultTo("pending");
      table
        .integer("reviewed_by")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table.dateTime("reviewed_at").nullable();
      addTimestamps(knex, table);
      table.index(["status", "created_at"]);
      table.index(["user_id"]);
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("subscription_payments");
  await knex.schema.dropTableIfExists("user_subscriptions");
  await knex.schema.dropTableIfExists("subscription_tiers");
  await knex.schema.dropTableIfExists("admin_tasks");
  await knex.schema.dropTableIfExists("admin_notes");
  await knex.schema.dropTableIfExists("user_reminders");
  await knex.schema.dropTableIfExists("user_tasks");
  await knex.schema.dropTableIfExists("user_notes");
};
