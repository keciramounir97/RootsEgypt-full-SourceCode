exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn("users", "admin_privileges");
  if (!hasColumn) {
    await knex.schema.alterTable("users", (table) => {
      table.text("admin_privileges").nullable();
    });
  }
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn("users", "admin_privileges");
  if (hasColumn) {
    await knex.schema.alterTable("users", (table) => {
      table.dropColumn("admin_privileges");
    });
  }
};
