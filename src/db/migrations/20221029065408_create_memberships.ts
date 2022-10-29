import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('memberships', (t) => {
    t.uuid('id', { primaryKey: true });
    t.boolean('admin').defaultTo(false);

    t.uuid('userId').notNullable().index();
    t.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

    t.uuid('groupId').notNullable().index();
    t.foreign('groupId').references('id').inTable('groups').onDelete('CASCADE');

    t.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('memberships');
}
