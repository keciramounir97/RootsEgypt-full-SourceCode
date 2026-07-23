exports.up = async function (knex) {
    const hasTable = await knex.schema.hasTable('download_requests');
    if (!hasTable) {
        await knex.schema.createTable('download_requests', (table) => {
            table.increments('id').primary();
            table.string('content_type', 20).notNullable();
            table.integer('content_id').unsigned().notNullable();
            table.string('content_title').nullable();
            table.dateTime('content_created_at').nullable();
            table.integer('owner_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
            table.integer('requester_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('status').notNullable().defaultTo('pending');
            table.dateTime('requested_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('processed_at').nullable();
            table.integer('processed_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');

            table.index(['content_type', 'content_id']);
            table.index(['requester_id']);
            table.index(['owner_id']);
            table.index(['status']);
        });
    }
};

exports.down = async function (knex) {
    const hasTable = await knex.schema.hasTable('download_requests');
    if (hasTable) {
        await knex.schema.dropTable('download_requests');
    }
};
