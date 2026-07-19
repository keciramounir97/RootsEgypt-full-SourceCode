exports.up = async function up(knex) {
  if (!(await knex.schema.hasTable("family_trees"))) return;
  if (await knex.schema.hasColumn("family_trees", "category")) return;

  await knex.schema.alterTable("family_trees", (table) => {
    table.string("category", 255).nullable();
  });
};

exports.down = async function down(knex) {
  if (!(await knex.schema.hasTable("family_trees"))) return;
  if (!(await knex.schema.hasColumn("family_trees", "category"))) return;

  await knex.schema.alterTable("family_trees", (table) => {
    table.dropColumn("category");
  });
};
