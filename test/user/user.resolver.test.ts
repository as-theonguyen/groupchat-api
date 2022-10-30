import { INestApplication } from '@nestjs/common';
import { hash } from 'argon2';
import { Knex } from 'knex';
import { initialize } from '@src/initialize';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { tokenFactory } from '@src/util/factories/token.factory';
import { userFactory } from '@src/util/factories/user.factory';
import { sendGraphQLRequest } from '@test/utils/send-graphql-request';

describe('UserResolver', () => {
  let app: INestApplication;
  let knex: Knex;

  const user = userFactory.build();
  const tokens = tokenFactory
    .params({ context: 'access', userId: user.id })
    .buildList(4);

  beforeAll(async () => {
    app = await initialize({ logger: false });
    knex = app.get(KNEX_CONNECTION);

    await knex('users').insert({
      ...user,
      password: await hash(user.password),
    });

    await knex('user_tokens').insert(tokens);

    await app.init();
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
    await app.close();
  });

  describe('me query', () => {
    const meQuery = /* GraphQL */ `
      query Me {
        me {
          id
          email
          username
        }
      }
    `;

    it('should return the current user', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: meQuery,
        operationName: 'Me',
        headers: {
          authorization: tokens[0].value,
        },
      });

      expect(response.data.me).toMatchObject({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    });

    it('should return null if no token is given', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: meQuery,
        operationName: 'Me',
      });

      expect(response.data.me).toBeNull();
    });
  });

  describe('updateUser mutation', () => {
    const updateUserMutation = /* GraphQL */ `
      mutation UpdateUser($input: UpdateUserInput!) {
        updateUser(input: $input) {
          id
          email
          username
        }
      }
    `;

    it('should update the user', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: updateUserMutation,
        operationName: 'UpdateUser',
        headers: {
          authorization: tokens[0].value,
        },
        variables: {
          input: {
            id: user.id,
            currentPassword: user.password,
            username: 'newusername',
          },
        },
      });

      expect(response.data.updateUser).toMatchObject({
        id: user.id,
        email: user.email,
        username: 'newusername',
      });
    });

    it('should apply guard', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: updateUserMutation,
        operationName: 'UpdateUser',
        variables: {
          input: {
            id: user.id,
            currentPassword: user.password,
            username: 'newusername',
          },
        },
      });

      expect(response.data).toBeNull();

      expect(response.errors[0].message).toBe('Unauthorized');
    });
  });
});
