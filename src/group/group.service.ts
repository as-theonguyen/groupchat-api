import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { CreateGroupInput } from './dto/create-group.dto';
import { UpdateGroupInput } from './dto/update-group.dto';
import { v4 } from 'uuid';

@Injectable()
export class GroupService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findAll() {
    const groups = await this.knex('groups').select('*');
    return groups;
  }

  async findById(id: string) {
    const [group] = await this.knex('groups').select('*').where({ id });

    if (!group) {
      return null;
    }

    return group;
  }

  async create(userId: string, input: CreateGroupInput) {
    const result = await this.knex.transaction(async (trx) => {
      try {
        const id = v4();

        const [group] = await trx('groups')
          .insert({
            id,
            name: input.name,
          })
          .returning('*');

        const membershipId = v4();

        await trx('memberships').insert({
          id: membershipId,
          userId,
          groupId: group.id,
          admin: true,
        });

        await trx.commit([group]);
      } catch (error) {
        await trx.rollback(error);
      }
    });

    return result[0];
  }

  async update(input: UpdateGroupInput) {
    const [updatedGroup] = await this.knex('groups')
      .update({ name: input.name })
      .where({ id: input.id })
      .returning('*');

    return updatedGroup;
  }

  async remove(id: string) {
    try {
      await this.knex('groups').delete().where({ id });
      return true;
    } catch (error) {
      return false;
    }
  }
}
