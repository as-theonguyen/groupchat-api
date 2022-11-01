import { hash } from 'argon2';
import { Knex } from 'knex';
import { tokenFactory } from '../../util/factories/token.factory';
import { groupFactory } from '../../util/factories/group.factory';
import { membershipFactory } from '../../util/factories/membership.factory';
import { messageFactory } from '../../util/factories/message.factory';
import { userFactory, UserType } from '../../util/factories/user.factory';

const groupAdmin = userFactory
  .params({
    email: 'group@admin.com',
    password: 'groupadmin',
    username: 'groupadmin',
  })
  .build();

const groupMember = userFactory
  .params({
    email: 'group@member.com',
    password: 'groupmember',
    username: 'groupmember',
  })
  .build();

const other = userFactory
  .params({
    email: 'other@user.com',
    password: 'otheruser',
    username: 'other',
  })
  .build();

const groupMemberToken = tokenFactory
  .params({ userId: groupMember.id, context: 'access' })
  .build();

const groupAdminToken = tokenFactory
  .params({ userId: groupAdmin.id, context: 'access' })
  .build();

const groups = groupFactory.buildList(2);

const adminMembership = membershipFactory
  .params({
    admin: true,
    userId: groupAdmin.id,
    groupId: groups[0].id,
  })
  .build();

const normalMembership = membershipFactory
  .params({
    admin: false,
    userId: groupMember.id,
    groupId: groups[0].id,
  })
  .build();

const otherMembership = membershipFactory
  .params({
    admin: true,
    userId: other.id,
    groupId: groups[1].id,
  })
  .build();

const messages = [
  messageFactory
    .params({ userId: groupAdmin.id, groupId: groups[0].id })
    .buildList(2),
  messageFactory
    .params({ userId: groupMember.id, groupId: groups[0].id })
    .buildList(4),
];

export async function seed(knex: Knex): Promise<void> {
  await knex('users').delete();
  await knex('groups').delete();

  const users = await hashPassword([groupAdmin, groupMember, other]);

  await knex('users').insert(users);
  await knex('user_tokens').insert([groupMemberToken, groupAdminToken]);
  await knex('groups').insert(groups);
  await knex('memberships').insert([
    adminMembership,
    normalMembership,
    otherMembership,
  ]);
  await knex('messages').insert(messages.flat());
}

async function hashPassword(users: UserType[]) {
  const hashed = [];

  for (let i = 0; i < users.length; i++) {
    hashed.push({
      ...users[i],
      password: await hash(users[i].password),
    });
  }

  return hashed;
}
