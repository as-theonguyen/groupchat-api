import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { v4 } from 'uuid';
import { hash, verify } from 'argon2';
import { UserService } from '@src/user/user.service';
import { tokenFactory } from '@src/util/factories/token.factory';
import { userFactory } from '@src/util/factories/user.factory';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';

describe('UserService', () => {
  let userService: UserService;
  let knex: Knex;

  const user = userFactory.build();

  const tokens = tokenFactory
    .params({
      context: 'access',
      userId: user.id,
    })
    .buildList(4);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test)],
      providers: [UserService],
    }).compile();

    userService = module.get(UserService);
    knex = module.get(KNEX_CONNECTION);

    await knex('users').insert([
      {
        ...user,
        password: await hash(user.password),
      },
    ]);

    await knex('user_tokens').insert(tokens);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
  });

  describe('findOne', () => {
    it('should find and return the user by the given params', async () => {
      const result = await userService.findOne(user.id);
      expect(result).toMatchObject({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    });

    it('should return null if the was no user found', async () => {
      const result = await userService.findOne(v4());
      expect(result).toBeNull();
    });
  });

  describe('findByToken', () => {
    it('should find and return the user by the token', async () => {
      const result = await userService.findByToken(tokens[0].value);
      expect(result).toMatchObject({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    });

    it('should return null if no user was found', async () => {
      const result = await userService.findByToken('doesnotexist');
      expect(result).toBeNull();
    });
  });

  describe('updateOne', () => {
    it('should find and update the user', async () => {
      const result = await userService.update({
        id: user.id,
        email: 'new@email.com',
        password: 'newpassword',
        currentPassword: user.password,
      });

      const [userInDb] = await knex('users')
        .select('*')
        .where('id', '=', user.id);

      const match = await verify(userInDb.password, 'newpassword');

      expect(match).toBe(true);
      expect(userInDb).toMatchObject(result);
    });

    it('should check the current password', async () => {
      await expect(
        userService.update({
          id: user.id,
          username: 'asdf',
          currentPassword: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
