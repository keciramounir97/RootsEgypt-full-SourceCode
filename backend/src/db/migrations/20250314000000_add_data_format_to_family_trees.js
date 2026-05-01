exports.up = async function (knex) {
    if (!(await knex.schema.hasTable("family_trees"))) return;
    const hasColumn = await knex.schema.hasColumn(
      "family_trees",
      "data_format",
    );
    if (!hasColumn) {
      await knex.schema.alterTable("family_trees", (table) => {
        table.string("data_format", 20).defaultTo("gedcom");
      });
    }
};

exports.down = async function (knex) {
    const hasColumn = await knex.schema.hasColumn(
      "family_trees",
      "data_format",
    );
    if (hasColumn) {
      await knex.schema.alterTable("family_trees", (table) => {
        table.dropColumn("data_format");
      });
    }
};
