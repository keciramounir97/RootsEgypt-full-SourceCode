exports.up = async function (knex) {
  if (await knex.schema.hasTable("suggestions")) return;

  await knex.schema.createTable("suggestions", (table) => {
    table.increments("id").primary();
    table.string("type", 80).notNullable().defaultTo("content");
    table.string("category", 255).nullable();
    table.string("content_title", 255).nullable();
    table
      .integer("user_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.string("user_name", 255).nullable();
    table.string("user_email", 255).nullable();
    table.string("user_phone", 80).nullable();
    table.text("message").nullable();
    table.string("status", 20).notNullable().defaultTo("pending");
    table
      .integer("processed_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.dateTime("processed_at").nullable();
    table.dateTime("created_at").defaultTo(knex.fn.now());
    table.dateTime("updated_at").defaultTo(knex.fn.now());

    table.index(["status", "created_at"]);
    table.index(["type", "status"]);
    table.index(["user_id"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("suggestions");
};
