exports.up = async function (knex) {
    const hasPasswordResets = await knex.schema.hasTable('password_reset_requests');
    if (!hasPasswordResets) {
        await knex.schema.createTable('password_reset_requests', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('email').notNullable();
            table.string('status').notNullable().defaultTo('pending');
            table.dateTime('requested_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('processed_at').nullable();
            table.integer('processed_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
            table.string('reset_token', 128).nullable();
            table.dateTime('token_expires_at').nullable();

            table.index(['user_id']);
            table.index(['status']);
            table.index(['email']);
        });
    }

    const hasAccountDeletions = await knex.schema.hasTable('account_deletion_requests');
    if (!hasAccountDeletions) {
        await knex.schema.createTable('account_deletion_requests', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('email').notNullable();
            table.text('reason').nullable();
            table.string('status').notNullable().defaultTo('pending');
            table.dateTime('requested_at').notNullable().defaultTo(knex.fn.now());
            table.dateTime('processed_at').nullable();
            table.integer('processed_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');

            table.index(['user_id']);
            table.index(['status']);
            table.index(['email']);
        });
    }
};

exports.down = async function (knex) {
    const hasAccountDeletions = await knex.schema.hasTable('account_deletion_requests');
    if (hasAccountDeletions) {
        await knex.schema.dropTable('account_deletion_requests');
    }

    const hasPasswordResets = await knex.schema.hasTable('password_reset_requests');
    if (hasPasswordResets) {
        await knex.schema.dropTable('password_reset_requests');
    }
};
