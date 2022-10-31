import { INestApplication } from '@nestjs/common';
import { Knex } from 'knex';
import { initialize } from '@src/initialize';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { tokenFactory } from '@src/util/factories/token.factory';
import { userFactory } from '@src/util/factories/user.factory';
import { sendGraphQLRequest } from '@test/utils/send-graphql-request';
import { groupFactory } from '@src/util/factories/group.factory';
import { membershipFactory } from '@src/util/factories/membership.factory';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('MembershipResolver', () => {
  let app: INestApplication;
  let knex: Knex;
  let jwt: JwtService;
  let configService: ConfigService;

  const admin = userFactory.build();
  const member = userFactory.build();

  const user = userFactory.build();

  const adminToken = tokenFactory
    .params({ context: 'access', userId: admin.id })
    .build();

  const memberToken = tokenFactory
    .params({ context: 'access', userId: member.id })
    .build();

  const userToken = tokenFactory
    .params({ context: 'access', userId: user.id })
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
    jwt = app.get(JwtService);
    configService = app.get(ConfigService);

    await knex('users').insert([admin, member, user]);

    await knex('user_tokens').insert([adminToken, memberToken, userToken]);

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

  describe('getInviteToken query', () => {
    const getInviteTokenQuery = /* GraphQL */ `
      query GetInviteToken($input: GetInviteTokenInput!) {
        getInviteToken(input: $input)
      }
    `;

    it('should return the invite token', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: getInviteTokenQuery,
        operationName: 'GetInviteToken',
        headers: {
          authorization: memberToken.value,
        },
        variables: {
          input: {
            groupId: group.id,
          },
        },
      });

      expect(response.data.getInviteToken).toBeDefined();
    });

    it('should only allow the group member to proceed', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: getInviteTokenQuery,
        operationName: 'GetInviteToken',
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

  describe('join mutation', () => {
    const joinMutation = /* GraphQL */ `
      mutation Join($input: JoinInput!) {
        join(input: $input) {
          id
          admin
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

    it('should return the created membership', async () => {
      const inviteToken = await jwt.signAsync(
        { groupId: group.id },
        { secret: configService.get('jwtSecret'), expiresIn: '10m' }
      );

      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: joinMutation,
        operationName: 'Join',
        headers: {
          authorization: userToken.value,
        },
        variables: {
          input: {
            userId: user.id,
            inviteToken,
          },
        },
      });

      expect(response.data.join).toMatchObject({
        admin: false,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        group: {
          id: group.id,
          name: group.name,
        },
      });
    });

    it('should only allow logged in user to proceed', async () => {
      const inviteToken = await jwt.signAsync(
        { groupId: group.id },
        { secret: configService.get('jwtSecret'), expiresIn: '10m' }
      );

      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: joinMutation,
        operationName: 'Join',
        variables: {
          input: {
            userId: user.id,
            inviteToken,
          },
        },
      });

      expect(response.data).toBeNull();

      expect(response.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('leave mutation', () => {
    const leaveMutation = /* GraphQL */ `
      mutation Leave($input: LeaveInput!) {
        leave(input: $input)
      }
    `;

    it('should remove the membership', async () => {
      const response = await sendGraphQLRequest({
        app: app.getHttpServer(),
        query: leaveMutation,
        operationName: 'Leave',
        headers: {
          authorization: memberToken.value,
        },
        variables: {
          input: {
            userId: member.id,
            groupId: group.id,
          },
        },
      });

      expect(response.data.leave).toBe(true);
    });
  });
});
