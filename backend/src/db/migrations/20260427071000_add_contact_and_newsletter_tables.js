exports.up = async function (knex) {
  const hasNewsletter = await knex.schema.hasTable("newsletter_subscribers");
  if (!hasNewsletter) {
    await knex.schema.createTable("newsletter_subscribers", (table) => {
      table.increments("id").primary();
      table.string("email").notNullable().unique();
      table.dateTime("created_at").defaultTo(knex.fn.now());
    });
  }

  const hasContact = await knex.schema.hasTable("contact_messages");
  if (!hasContact) {
    await knex.schema.createTable("contact_messages", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("email").notNullable();
      table.text("message").notNullable();
      table.dateTime("created_at").defaultTo(knex.fn.now());

      table.index(["created_at"]);
      table.index(["email"]);
    });
  }
};

exports.down = async function (knex) {
  const hasContact = await knex.schema.hasTable("contact_messages");
  if (hasContact) {
    await knex.schema.dropTable("contact_messages");
  }

  const hasNewsletter = await knex.schema.hasTable("newsletter_subscribers");
  if (hasNewsletter) {
    await knex.schema.dropTable("newsletter_subscribers");
  }
};
