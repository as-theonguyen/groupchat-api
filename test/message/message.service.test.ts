import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { userFactory } from '@src/util/factories/user.factory';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';
import { groupFactory } from '@src/util/factories/group.factory';
import { MessageService } from '@src/message/message.service';
import { messageFactory } from '@src/util/factories/message.factory';
import { faker } from '@faker-js/faker';
import { v4 } from 'uuid';

describe('MessageService', () => {
  let messageService: MessageService;
  let knex: Knex;

  const user = userFactory.build();

  const group = groupFactory.build();

  const messages = messageFactory
    .params({ userId: user.id, groupId: group.id })
    .buildList(10);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test)],
      providers: [MessageService],
    }).compile();

    messageService = module.get(MessageService);
    knex = module.get(KNEX_CONNECTION);

    await knex('users').insert(user);
    await knex('groups').insert(group);
    await knex('messages').insert(messages);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex('groups').delete();
    await knex.destroy();
  });

  describe('findById', () => {
    it('should find and return the message by id', async () => {
      const result = await messageService.findById({ id: messages[0].id });
      expect(result).toMatchObject(messages[0]);
    });

    it('should return null if no message was found', async () => {
      const result = await messageService.findById({ id: v4() });
      expect(result).toBeNull();
    });
  });

  describe('findByGroup', () => {
    it('should find and return all messages belong to the group', async () => {
      const result = await messageService.findByGroup({ groupId: group.id });
      expect(result).toMatchObject(messages);
    });
  });

  describe('create', () => {
    it('should create and return the message', async () => {
      const createMessageData = {
        content: faker.lorem.words(),
        groupId: group.id,
      };

      const result = await messageService.create(user.id, createMessageData);

      expect(result).toMatchObject({
        content: createMessageData.content,
        groupId: group.id,
        userId: user.id,
      });

      const [messageInDb] = await knex('messages')
        .select('*')
        .where({ id: result.id });

      expect(messageInDb).toBeDefined();

      expect(messageInDb).toMatchObject({
        content: createMessageData.content,
        groupId: group.id,
        userId: user.id,
      });
    });
  });

  describe('remove', () => {
    it('should remove the message', async () => {
      const result = await messageService.remove({ id: messages[1].id });

      expect(result).toBe(true);

      const [messageInDb] = await knex('messages')
        .select('*')
        .where({ id: messages[1].id });

      expect(messageInDb).toBeUndefined();
    });
  });
});
