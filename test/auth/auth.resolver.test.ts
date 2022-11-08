import { INestApplication } from '@nestjs/common';
import { hash } from 'argon2';
import { Knex } from 'knex';
import { initialize } from '@src/initialize';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { tokenFactory } from '@src/util/factories/token.factory';
import { userFactory } from '@src/util/factories/user.factory';
import { sendGraphQLRequest } from '@test/utils/send-graphql-request';

describe('AuthResolver', () => {
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

  describe('register mutation', () => {
    const registerMutation = /* GraphQL */ `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          accessToken
          user {
            id
            email
            username
          }
        }
      }
    `;

    it('should return the user with the access token', async () => {
      const { id, ...registerData } = userFactory.build();

      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: registerMutation,
        operationName: 'Register',
        variables: {
          input: registerData,
        },
      });

      expect(response.data.register.user).toMatchObject({
        email: registerData.email,
        username: registerData.username,
      });

      expect(response.data.register.accessToken).toBeDefined();
    });
  });

  describe('login mutation', () => {
    const loginMutation = /* GraphQL */ `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          accessToken
          user {
            id
            email
            username
          }
        }
      }
    `;

    it('should return the user with the access token', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: loginMutation,
        operationName: 'Login',
        variables: {
          input: {
            email: user.email,
            password: user.password,
          },
        },
      });

      expect(response.data.login.user).toMatchObject({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      expect(response.data.login.accessToken).toBeDefined();
    });
  });

  describe('logout mutation', () => {
    const logoutMutation = /* GraphQL */ `
      mutation Logout($input: LogoutInput!) {
        logout(input: $input)
      }
    `;

    it('should log the user out', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: logoutMutation,
        operationName: 'Logout',
        variables: {
          input: {
            all: false,
          },
        },
        headers: {
          authorization: tokens[0].value,
        },
      });

      expect(response.data.logout).toBe(true);
    });

    it('should log the user out from all devices', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: logoutMutation,
        operationName: 'Logout',
        variables: {
          input: {
            all: true,
          },
        },
        headers: {
          authorization: tokens[1].value,
        },
      });

      expect(response.data.logout).toBe(true);
    });

    it('should only allow logged in user', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: logoutMutation,
        operationName: 'Logout',
        variables: {
          input: {
            all: false,
          },
        },
      });

      expect(response.data).toBeNull();
      expect(response.errors[0].message).toBe('Unauthorized');
    });
  });
});
