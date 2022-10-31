import { INestApplication } from '@nestjs/common';
import { Knex } from 'knex';
import { initialize } from '@src/initialize';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { tokenFactory } from '@src/util/factories/token.factory';
import { userFactory } from '@src/util/factories/user.factory';
import { sendGraphQLRequest } from '@test/utils/send-graphql-request';
import { groupFactory } from '@src/util/factories/group.factory';
import { membershipFactory } from '@src/util/factories/membership.factory';
import { faker } from '@faker-js/faker';

describe('GroupResolver', () => {
  let app: INestApplication;
  let knex: Knex;

  const admin = userFactory.build();
  const member = userFactory.build();

  const adminToken = tokenFactory
    .params({ context: 'access', userId: admin.id })
    .build();

  const memberToken = tokenFactory
    .params({ context: 'access', userId: member.id })
    .build();

  const group = groupFactory.build();

  const adminMembership = membershipFactory
    .params({ admin: true, userId: admin.id, groupId: group.id })
    .build();
  const normalMembership = membershipFactory
    .params({ admin: false, userId: member.id, groupId: group.id })
    .build();

  beforeAll(async () => {
    app = await initialize({ logger: false });
    knex = app.get(KNEX_CONNECTION);

    await knex('users').insert([admin, member]);

    await knex('user_tokens').insert([adminToken, memberToken]);

    await knex('groups').insert(group);

    await knex('memberships').insert([adminMembership, normalMembership]);

    await app.init();
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex('groups').delete();
    await knex.destroy();
    await app.close();
  });

  describe('groups query', () => {
    const groupsQuery = /* GraphQL */ `
      query Groups {
        groups {
          id
          name
        }
      }
    `;

    it('should return all groups', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: groupsQuery,
        operationName: 'Groups',
      });

      expect(response.data.groups).toMatchObject([group]);
    });
  });

  describe('group query', () => {
    const groupQuery = /* GraphQL */ `
      query Group($input: GroupInput!) {
        group(input: $input) {
          id
          name
        }
      }
    `;

    it('should return the group by id', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: groupQuery,
        operationName: 'Group',
        variables: {
          input: {
            id: group.id,
          },
        },
      });

      expect(response.data.group).toMatchObject(group);
    });
  });

  describe('createGroup mutation', () => {
    const createGroupMutation = /* GraphQL */ `
      mutation CreateGroup($input: CreateGroupInput!) {
        createGroup(input: $input) {
          id
          name
          memberships {
            id
            admin
            user {
              id
              email
              username
            }
          }
        }
      }
    `;

    it('should return the created group', async () => {
      const createGroupData = {
        name: faker.company.name(),
      };

      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: createGroupMutation,
        operationName: 'CreateGroup',
        headers: {
          authorization: memberToken.value,
        },
        variables: {
          input: createGroupData,
        },
      });

      expect(response.data.createGroup).toMatchObject({
        name: createGroupData.name,
        memberships: [
          {
            admin: true,
            user: {
              id: member.id,
              email: member.email,
              username: member.username,
            },
          },
        ],
      });
    });

    it('should only allow logged in users to proceed', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: createGroupMutation,
        operationName: 'CreateGroup',
        variables: {
          input: {
            name: 'asdf',
          },
        },
      });

      expect(response.data).toBeNull();

      expect(response.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('updateGroup mutation', () => {
    const updateGroupMutation = /* GraphQL */ `
      mutation UpdateGroup($input: UpdateGroupInput!) {
        updateGroup(input: $input) {
          id
          name
        }
      }
    `;

    it('should return the updated group', async () => {
      const updateGroupData = {
        id: group.id,
        name: faker.company.name(),
      };

      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: updateGroupMutation,
        operationName: 'UpdateGroup',
        headers: {
          authorization: adminToken.value,
        },
        variables: {
          input: updateGroupData,
        },
      });

      expect(response.data.updateGroup).toMatchObject(updateGroupData);
    });

    it('should only allow the group admin to proceed', async () => {
      const updateGroupData = {
        id: group.id,
        name: faker.company.name(),
      };

      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: updateGroupMutation,
        operationName: 'UpdateGroup',
        headers: {
          authorization: memberToken.value,
        },
        variables: {
          input: updateGroupData,
        },
      });

      expect(response.data).toBeNull();

      expect(response.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('removeGroup mutation', () => {
    const removeGroupMutation = /* GraphQL */ `
      mutation RemoveGroup($input: GroupInput!) {
        removeGroup(input: $input)
      }
    `;

    it('should only allow the group admin to procedd', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: removeGroupMutation,
        operationName: 'RemoveGroup',
        headers: {
          authorization: memberToken.value,
        },
        variables: {
          input: {
            id: group.id,
          },
        },
      });

      expect(response.data).toBe(null);

      expect(response.errors[0].message).toBe('Unauthorized');
    });

    it('should remove the the group', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: removeGroupMutation,
        operationName: 'RemoveGroup',
        headers: {
          authorization: adminToken.value,
        },
        variables: {
          input: {
            id: group.id,
          },
        },
      });

      expect(response.data.removeGroup).toBe(true);
    });
  });
});
