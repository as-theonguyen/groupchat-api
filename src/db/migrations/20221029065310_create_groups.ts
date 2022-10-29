import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('groups', (t) => {
    t.uuid('id', { primaryKey: true });
    t.string('name').notNullable();

    t.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('groups');
}
