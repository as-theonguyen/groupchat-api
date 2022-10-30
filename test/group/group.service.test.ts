import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { userFactory } from '@src/util/factories/user.factory';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';
import { GroupService } from '@src/group/group.service';
import { groupFactory } from '@src/util/factories/group.factory';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';

describe('GroupService', () => {
  let groupService: GroupService;
  let knex: Knex;

  const user = userFactory.build();

  const groups = groupFactory.buildList(4);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test)],
      providers: [GroupService],
    }).compile();

    groupService = module.get(GroupService);
    knex = module.get(KNEX_CONNECTION);

    await knex('users').insert(user);
    await knex('groups').insert(groups);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex('groups').delete();
    await knex.destroy();
  });

  describe('findAll', () => {
    it('should return all groups', async () => {
      const result = await groupService.findAll();
      expect(result.sort((a, b) => a.id.localeCompare(b.id))).toMatchObject(
        groups.sort((a, b) => a.id.localeCompare(b.id))
      );
    });
  });

  describe('findById', () => {
    it('should return the group by id', async () => {
      const result = await groupService.findById(groups[0].id);
      expect(result).toMatchObject(groups[0]);
    });

    it('should return null if no group was found', async () => {
      const result = await groupService.findById(v4());
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create the group and mark the user as the admin', async () => {
      const createGroupData = {
        name: faker.company.name(),
      };

      const result = await groupService.create(user.id, createGroupData);

      expect(result).toMatchObject({
        name: createGroupData.name,
      });

      const [groupInDb] = await knex('groups')
        .select('*')
        .where({ id: result.id });

      expect(groupInDb).toMatchObject({
        id: result.id,
        name: createGroupData.name,
      });

      const [membershipInDb] = await knex('memberships')
        .select('*')
        .where({ groupId: result.id })
        .andWhere({ userId: user.id });

      expect(membershipInDb).toBeDefined();
      expect(membershipInDb.admin).toBe(true);
    });
  });

  describe('update', () => {
    it('should update the group', async () => {
      const updateGroupData = {
        id: groups[1].id,
        name: faker.company.name(),
      };

      const result = await groupService.update(updateGroupData);

      expect(result).toMatchObject(updateGroupData);

      const [groupInDb] = await knex('groups')
        .select('*')
        .where({ id: groups[1].id });

      expect(groupInDb).toMatchObject(updateGroupData);
    });
  });

  describe('remove', () => {
    it('should delete the group', async () => {
      const result = await groupService.remove(groups[2].id);

      expect(result).toBe(true);

      const [groupInDb] = await knex('groups')
        .select('*')
        .where({ id: groups[2].id });

      expect(groupInDb).toBeUndefined();
    });
  });
});
