exports.up = async function (knex) {
  // Each table is created independently so a partial prior run is safe.

  // 1. Roles
  if (!(await knex.schema.hasTable("roles"))) {
    await knex.schema.createTable("roles", (table) => {
      table.integer("id").primary();
      table.string("name").unique().notNullable();
      table.string("permissions");
    });
  }

  // 2. Users
  if (!(await knex.schema.hasTable("users"))) {
    await knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("full_name");
      table.string("phone_number");
      table.string("email").unique().notNullable();
      table.string("password").notNullable();
      table.integer("role_id").unsigned().references("id").inTable("roles");
      table.string("status").defaultTo("active");
      table.string("session_token");
      table.dateTime("last_login");
      table.dateTime("created_at").defaultTo(knex.fn.now());
      table.dateTime("updated_at").defaultTo(knex.fn.now()); // On update trigger handled by app or DB
    });
  }

  // 3. Activity Logs
  if (!(await knex.schema.hasTable("activity_logs"))) {
    await knex.schema.createTable("activity_logs", (table) => {
      table.increments("id").primary();
      table
        .integer("actor_user_id")
        .unsigned()
        .references("id")
        .inTable("users");
      table.string("type").notNullable();
      table.string("description").notNullable();
      table.dateTime("created_at").defaultTo(knex.fn.now());

      table.index(["actor_user_id", "created_at"]);
      table.index(["type", "created_at"]);
    });
  }

  // 4. App Settings
  if (!(await knex.schema.hasTable("app_settings"))) {
    await knex.schema.createTable("app_settings", (table) => {
      table.string("key").primary();
      table.string("value").notNullable();
      table.dateTime("updated_at").defaultTo(knex.fn.now());
    });
  }

  // 5. Password Resets
  if (!(await knex.schema.hasTable("password_resets"))) {
    await knex.schema.createTable("password_resets", (table) => {
      table.string("email").primary();
      table.string("code_hash").notNullable();
      table.dateTime("expires_at").notNullable();
      table.dateTime("created_at").defaultTo(knex.fn.now());
    });
  }

  // 6. Refresh Tokens
  if (!(await knex.schema.hasTable("refresh_tokens"))) {
    await knex.schema.createTable("refresh_tokens", (table) => {
      table.increments("id").primary();
      table.string("token").unique().notNullable();
      table
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.dateTime("expires_at").notNullable();
      table.dateTime("created_at").defaultTo(knex.fn.now());

      table.index(["user_id"]);
      table.index(["token"]);
    });
  }

  // 7. Books
  if (!(await knex.schema.hasTable("books"))) {
    await knex.schema.createTable("books", (table) => {
      table.increments("id").primary();
      table.string("title").notNullable();
      table.string("author");
      table.string("description");
      table.string("category");
      table.string("file_path").notNullable();
      table.string("cover_path");
      table.bigInteger("file_size"); // BigInt support
      table.string("archive_source");
      table.string("document_code");
      table
        .integer("uploaded_by")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table.boolean("is_public").defaultTo(false);
      table.integer("download_count").defaultTo(0);
      table.dateTime("created_at").defaultTo(knex.fn.now());

      table.index(["is_public", "created_at"]);
      table.index(["uploaded_by"]);
      table.index(["category"]);
      table.index(["title"]);
    });
  }

  // 8. Family Trees
  if (!(await knex.schema.hasTable("family_trees"))) {
    await knex.schema.createTable("family_trees", (table) => {
      table.increments("id").primary();
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table.string("title").notNullable();
      table.string("description");
      table.string("gedcom_path");
      table.string("archive_source");
      table.string("document_code");
      table.boolean("is_public").defaultTo(false);
      table.dateTime("created_at").defaultTo(knex.fn.now());
      table.dateTime("updated_at").defaultTo(knex.fn.now());

      table.index(["is_public", "created_at"]);
      table.index(["user_id"]);
      table.index(["title"]);
    });
  }

  // 9. Gallery
  if (!(await knex.schema.hasTable("gallery"))) {
    await knex.schema.createTable("gallery", (table) => {
      table.increments("id").primary();
      table.string("title").notNullable();
      table.text("description"); // text type
      table.string("image_path").notNullable();
      table
        .integer("uploaded_by")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table
        .integer("book_id")
        .unsigned()
        .references("id")
        .inTable("books")
        .onDelete("CASCADE");
      table
        .integer("tree_id")
        .unsigned()
        .references("id")
        .inTable("family_trees")
        .onDelete("CASCADE");
      table.boolean("is_public").defaultTo(true);
      table.string("archive_source");
      table.string("document_code");
      table.string("location");
      table.string("year");
      table.string("photographer");
      table.dateTime("created_at").defaultTo(knex.fn.now());
      table.dateTime("updated_at").defaultTo(knex.fn.now());

      table.index(["is_public", "created_at"]);
      table.index(["uploaded_by"]);
      table.index(["book_id"]);
      table.index(["tree_id"]);
      table.index(["location"]);
      table.index(["created_at"]);
    });
  }

  // 10. Persons
  if (!(await knex.schema.hasTable("persons"))) {
    await knex.schema.createTable("persons", (table) => {
      table.increments("id").primary();
      table
        .integer("tree_id")
        .unsigned()
        .references("id")
        .inTable("family_trees")
        .onDelete("CASCADE");
      table.string("name");

      table.index(["tree_id"]);
    });
  }
};;

exports.down = async function (knex) {
  // Drop in reverse order to respect foreign keys
  await knex.schema.dropTableIfExists("persons");
  await knex.schema.dropTableIfExists("gallery");
  await knex.schema.dropTableIfExists("family_trees");
  await knex.schema.dropTableIfExists("books");
  await knex.schema.dropTableIfExists("refresh_tokens");
  await knex.schema.dropTableIfExists("password_resets");
  await knex.schema.dropTableIfExists("app_settings");
  await knex.schema.dropTableIfExists("activity_logs");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("roles");
};
