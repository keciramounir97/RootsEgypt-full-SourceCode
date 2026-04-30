export async function seed(knex) {
    // Deletes ALL existing entries
    await knex('roles').del();

    // Inserts seed entries
    await knex('roles').insert([
        { id: 1, name: 'admin', permissions: 'all' },
        { id: 2, name: 'user', permissions: 'read_only' },
        { id: 3, name: 'super_admin', permissions: 'all' },
    ]);
}
