/**
 * Add updated_at to activity_logs (for compatibility with BaseModel/Objection timestamps)
 */
exports.up = async function (knex) {
    if (!(await knex.schema.hasTable("activity_logs"))) return;
    const hasColumn = await knex.schema.hasColumn('activity_logs', 'updated_at');
    if (!hasColumn) {
        await knex.schema.alterTable('activity_logs', (table) => {
            table.dateTime('updated_at').defaultTo(knex.fn.now());
        });
    }
};

exports.down = async function (knex) {
    const hasColumn = await knex.schema.hasColumn('activity_logs', 'updated_at');
    if (hasColumn) {
        await knex.schema.alterTable('activity_logs', (table) => {
            table.dropColumn('updated_at');
        });
    }
};
