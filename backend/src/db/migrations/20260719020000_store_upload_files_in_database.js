exports.up = async function up(knex) {
  const addColumn = async (tableName, columnName, callback) => {
    if (!(await knex.schema.hasTable(tableName))) return;
    if (await knex.schema.hasColumn(tableName, columnName)) return;
    await knex.schema.alterTable(tableName, callback);
  };

  await addColumn("books", "file_data", (table) =>
    table.specificType("file_data", "LONGBLOB").nullable(),
  );
  await addColumn("books", "file_mime_type", (table) =>
    table.string("file_mime_type", 120).nullable(),
  );
  await addColumn("books", "cover_data", (table) =>
    table.specificType("cover_data", "LONGBLOB").nullable(),
  );
  await addColumn("books", "cover_mime_type", (table) =>
    table.string("cover_mime_type", 120).nullable(),
  );
  await addColumn("gallery", "image_data", (table) =>
    table.specificType("image_data", "LONGBLOB").nullable(),
  );
  await addColumn("gallery", "image_mime_type", (table) =>
    table.string("image_mime_type", 120).nullable(),
  );
  await addColumn("documents", "file_data", (table) =>
    table.specificType("file_data", "LONGBLOB").nullable(),
  );
  await addColumn("documents", "file_mime_type", (table) =>
    table.string("file_mime_type", 120).nullable(),
  );
};

exports.down = async function down(knex) {
  const dropColumn = async (tableName, columnName) => {
    if (!(await knex.schema.hasTable(tableName))) return;
    if (!(await knex.schema.hasColumn(tableName, columnName))) return;
    await knex.schema.alterTable(tableName, (table) => table.dropColumn(columnName));
  };

  for (const [tableName, columnName] of [
    ["books", "file_data"],
    ["books", "file_mime_type"],
    ["books", "cover_data"],
    ["books", "cover_mime_type"],
    ["gallery", "image_data"],
    ["gallery", "image_mime_type"],
    ["documents", "file_data"],
    ["documents", "file_mime_type"],
  ]) {
    await dropColumn(tableName, columnName);
  }
};
