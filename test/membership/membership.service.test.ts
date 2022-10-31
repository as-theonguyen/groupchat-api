import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { userFactory } from '@src/util/factories/user.factory';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';
import { groupFactory } from '@src/util/factories/group.factory';
import { MembershipService } from '@src/membership/membership.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '@src/config/configuration';

describe('MembershipService', () => {
  let membershipService: MembershipService;
  let knex: Knex;
  let jwt: JwtService;
  let configService: ConfigService;

  const user = userFactory.build();

  const group = groupFactory.build();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        KnexModule.forRoot(knexConfig.test),
        JwtModule.register({}),
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [MembershipService],
    }).compile();

    membershipService = module.get(MembershipService);
    jwt = module.get(JwtService);
    knex = module.get(KNEX_CONNECTION);
    configService = module.get(ConfigService);

    await knex('users').insert(user);
    await knex('groups').insert(group);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex('groups').delete();
    await knex.destroy();
  });

  describe('getInviteToken', () => {
    it('should generate and return the jwt', async () => {
      const result = await membershipService.getInviteToken({
        groupId: group.id,
      });
      expect(result).toBeDefined();

      const payload = await jwt.verifyAsync(result, {
        secret: configService.get('jwtSecret'),
      });

      expect(payload).toMatchObject({
        groupId: group.id,
      });
    });
  });

  describe('join', () => {
    it('should decode the jwt, create, and return a new membership in the database', async () => {
      const token = await jwt.signAsync(
        { groupId: group.id },
        { secret: configService.get('jwtSecret'), expiresIn: '10m' }
      );

      const result = await membershipService.join({
        inviteToken: token,
        userId: user.id,
      });

      expect(result).toMatchObject({
        userId: user.id,
        groupId: group.id,
        admin: false,
      });

      const [membershipInDb] = await knex('memberships')
        .select('*')
        .where({ userId: user.id })
        .andWhere({ groupId: group.id });

      expect(membershipInDb).toBeDefined();

      expect(membershipInDb.admin).toBe(false);
    });
  });

  describe('leave', () => {
    it('should delete the membership from the database', async () => {
      const result = await membershipService.leave({
        userId: user.id,
        groupId: group.id,
      });
      expect(result).toBe(true);

      const [membershipInDb] = await knex('memberships')
        .select('*')
        .where({ userId: user.id })
        .andWhere({ groupId: group.id });

      expect(membershipInDb).toBeUndefined();
    });
  });
});
