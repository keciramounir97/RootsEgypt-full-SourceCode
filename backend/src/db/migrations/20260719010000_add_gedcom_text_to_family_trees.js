exports.up = async function up(knex) {
  if (!(await knex.schema.hasTable("family_trees"))) return;
  if (await knex.schema.hasColumn("family_trees", "gedcom_text")) return;

  await knex.schema.alterTable("family_trees", (table) => {
    table.text("gedcom_text", "longtext").nullable();
  });
};

exports.down = async function down(knex) {
  if (!(await knex.schema.hasTable("family_trees"))) return;
  if (!(await knex.schema.hasColumn("family_trees", "gedcom_text"))) return;

  await knex.schema.alterTable("family_trees", (table) => {
    table.dropColumn("gedcom_text");
  });
};
