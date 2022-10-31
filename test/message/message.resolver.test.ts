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
import { messageFactory } from '@src/util/factories/message.factory';

describe('MessageResolver', () => {
  let app: INestApplication;
  let knex: Knex;

  const admin = userFactory.build();

  const member = userFactory.build();

  const user = userFactory.build();

  const memberToken = tokenFactory
    .params({ context: 'access', userId: member.id })
    .build();

  const userToken = tokenFactory
    .params({ context: 'access', userId: user.id })
    .build();

  const adminToken = tokenFactory
    .params({ context: 'access', userId: admin.id })
    .build();

  const group = groupFactory.build();

  const adminMembership = membershipFactory
    .params({ admin: true, userId: admin.id, groupId: group.id })
    .build();

  const membership = membershipFactory
    .params({ admin: false, userId: member.id, groupId: group.id })
    .build();

  const messages = messageFactory
    .params({ userId: member.id, groupId: group.id })
    .buildList(10);

  beforeAll(async () => {
    app = await initialize({ logger: false });
    knex = app.get(KNEX_CONNECTION);

    await knex('users').insert([user, member, admin]);

    await knex('user_tokens').insert([userToken, memberToken, adminToken]);

    await knex('groups').insert(group);

    await knex('memberships').insert([membership, adminMembership]);

    await knex('messages').insert(messages);

    await app.init();
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex('groups').delete();
    await knex.destroy();
    await app.close();
  });

  describe('messages query', () => {
    const messagesQuery = /* GraphQL */ `
      query Messages($input: FindByGroupInput!) {
        messages(input: $input) {
          id
          content
          user {
            id
            email
            username
          }
          group {
            id
            name
          }
        }
      }
    `;

    it('should return all messages by group', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: messagesQuery,
        operationName: 'Messages',
        headers: {
          authorization: memberToken.value,
        },
        variables: {
          input: {
            groupId: group.id,
          },
        },
      });

      const expectedMessages = messages.map((m) => ({
        id: m.id,
        content: m.content,
        user: {
          id: member.id,
          username: member.username,
          email: member.email,
        },
        group: {
          id: group.id,
          name: group.name,
        },
      }));

      expect(response.data.messages).toMatchObject(expectedMessages);
    });

    it('should only allow group members to proceed', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: messagesQuery,
        operationName: 'Messages',
        headers: {
          authorization: userToken.value,
        },
        variables: {
          input: {
            groupId: group.id,
          },
        },
      });

      expect(response.data).toBeNull();

      expect(response.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('createMessage mutation', () => {
    const createMessageMutation = /* GraphQL */ `
      mutation CreateMessage($input: CreateMessageInput!) {
        createMessage(input: $input) {
          id
          content
        }
      }
    `;

    it('should return the created message', async () => {
      const createMessageData = {
        content: faker.lorem.words(),
        groupId: group.id,
      };

      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: createMessageMutation,
        operationName: 'CreateMessage',
        headers: {
          authorization: memberToken.value,
        },
        variables: {
          input: createMessageData,
        },
      });

      expect(response.data.createMessage).toMatchObject({
        content: createMessageData.content,
      });
    });

    it('should only allow group members to proceed', async () => {
      const createMessageData = {
        content: faker.lorem.words(),
        groupId: group.id,
      };

      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: createMessageMutation,
        operationName: 'CreateMessage',
        headers: {
          authorization: userToken.value,
        },
        variables: {
          input: createMessageData,
        },
      });

      expect(response.data).toBeNull();

      expect(response.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('removeMessage mutation', () => {
    const removeMessageMutation = /* GraphQL */ `
      mutation RemoveMessage($input: MessageInput!) {
        removeMessage(input: $input)
      }
    `;

    it('should remove the message', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: removeMessageMutation,
        operationName: 'RemoveMessage',
        headers: {
          authorization: memberToken.value,
        },
        variables: {
          input: {
            id: messages[0].id,
          },
        },
      });

      expect(response.data.removeMessage).toBe(true);
    });

    it('should only allow the author to proceed', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: removeMessageMutation,
        operationName: 'RemoveMessage',
        headers: {
          authorization: adminToken.value,
        },
        variables: {
          input: {
            id: messages[1].id,
          },
        },
      });

      expect(response.data).toBeNull();

      expect(response.errors[0].message).toBe('Unauthorized');
    });
  });
});
