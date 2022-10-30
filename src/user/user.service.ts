import { Inject, Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { UpdateUserInput } from '@src/user/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findOne(id: string) {
    const [user] = await this.knex('users')
      .select(['id', 'username', 'email'])
      .where({ id });

    if (!user) {
      return null;
    }

    return user;
  }

  async findByToken(token: string, context: string = 'access') {
    const [user] = await this.knex
      .select('u.*')
      .from('users as u')
      .join('user_tokens as t', 'u.id', '=', 't.userId')
      .where('t.value', '=', token)
      .andWhere('t.context', '=', context);

    if (!user) {
      return null;
    }

    return user;
  }

  async update({ currentPassword, id, ...input }: UpdateUserInput) {
    const result = await this.knex.transaction(async (trx) => {
      try {
        const [user] = await trx('users').select('*').where({ id });

        if (!user) {
          throw new Error('User not found');
        }

        const match = await verify(user.password, currentPassword);

        if (!match) {
          throw new Error('Invalid credentials');
        }

        let newPassword: string | null | undefined;

        if (input.password) {
          newPassword = await hash(input.password);
        }

        const [updatedUser] = await trx('users')
          .update({
            ...input,
            password: newPassword,
          })
          .where({ id })
          .returning('*');

        await trx.commit([updatedUser]);
      } catch (error) {
        await trx.rollback(error);
      }
    });

    return result[0];
  }
}
