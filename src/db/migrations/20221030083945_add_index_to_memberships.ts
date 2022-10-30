import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('memberships', (t) => {
    t.unique(['userId', 'groupId'], { indexName: 'userId_groupId_unique' });
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('memberships', (t) => {
    t.dropUnique(['userId', 'groupId'], 'userId_groupId_unique');
  });
}
