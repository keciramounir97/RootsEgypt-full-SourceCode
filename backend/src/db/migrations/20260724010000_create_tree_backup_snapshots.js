exports.up = async function (knex) {
  if (await knex.schema.hasTable("tree_backup_snapshots")) return;
  await knex.schema.createTable("tree_backup_snapshots", (table) => {
    table.increments("id").primary();
    table.integer("tree_id").unsigned().nullable();
    table.integer("actor_id").unsigned().nullable();
    table.string("reason", 80).notNullable().defaultTo("manual");
    table.text("payload_json", "longtext").notNullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("restored_at").nullable();
    table.integer("restored_by").unsigned().nullable();
    table.index(["tree_id", "created_at"]);
  });
};
exports.down = async function () {};
