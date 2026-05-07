exports.up = async function (knex) {
  if (await knex.schema.hasTable("gallery")) {
    const hasSeedKey = await knex.schema.hasColumn("gallery", "seed_key");
    if (!hasSeedKey) {
      await knex.schema.alterTable("gallery", (table) => {
        table.string("seed_key", 120).nullable();
      });
    }
  }
};

exports.down = async function (knex) {
  if (await knex.schema.hasTable("gallery")) {
    const hasSeedKey = await knex.schema.hasColumn("gallery", "seed_key");
    if (hasSeedKey) {
      await knex.schema.alterTable("gallery", (table) => {
        table.dropColumn("seed_key");
      });
    }
  }
};
