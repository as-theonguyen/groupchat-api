import { Inject, Injectable } from '@nestjs/common';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { Knex } from 'knex';
import { v4 } from 'uuid';
import { CreateMessageInput } from './dto/create-message.dto';
import { FindByGroupInput } from './dto/find-by-group.dto';
import { MessageInput } from './dto/message.dto';

@Injectable()
export class MessageService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findById(input: MessageInput) {
    const [message] = await this.knex('messages').select('*').where(input);

    if (!message) {
      return null;
    }

    return message;
  }

  async findByGroup(input: FindByGroupInput) {
    const messages = await this.knex('messages')
      .select('*')
      .where(input)
      .orderBy('createdAt', 'desc');

    return messages;
  }

  async create(userId: string, { groupId, content }: CreateMessageInput) {
    const id = v4();

    const [message] = await this.knex('messages')
      .insert({
        id,
        userId,
        groupId,
        content,
      })
      .returning('*');

    return message;
  }

  async remove(input: MessageInput) {
    try {
      await this.knex('messages').delete().where(input);
      return true;
    } catch (error) {
      return false;
    }
  }
}
