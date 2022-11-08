import { Inject, Injectable } from '@nestjs/common';
import { Group } from '@src/group/group.type';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { UserService } from '@src/user/user.service';
import { User } from '@src/user/user.type';
import { randomBytes } from 'crypto';
import * as DataLoader from 'dataloader';
import { Request } from 'express';
import { Knex } from 'knex';

@Injectable()
export class UtilService {
  constructor(
    private readonly userService: UserService,
    @Inject(KNEX_CONNECTION) private readonly knex: Knex
  ) {}

  generateRandomToken() {
    return new Promise<string>((resolve, reject) => {
      randomBytes(48, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          const token = buf.toString('base64');
          resolve(token);
        }
      });
    });
  }

  async buildGraphQLContext(authorization?: string, req?: Request) {
    let user: User | null;

    if (!authorization) {
      user = null;
    } else {
      user = await this.userService.findByToken(authorization);
    }

    return {
      req,
      user,
      userLoader: this.createUserLoader(),
      groupLoader: this.createGroupLoader(),
    };
  }

  private createUserLoader() {
    const userLoader = new DataLoader<string, User>(async (userIds) => {
      const users = await this.knex('users').select('*').whereIn('id', userIds);
      const userIdToUser: Record<string, User> = {};

      users.forEach((u) => {
        userIdToUser[u.id] = u;
      });

      const sortedUsers = userIds.map((id) => userIdToUser[id]);
      return sortedUsers;
    });

    return userLoader;
  }

  private createGroupLoader() {
    const groupLoader = new DataLoader<string, Group>(async (groupIds) => {
      const groups = await this.knex('groups')
        .select('*')
        .whereIn('id', groupIds);
      const groupIdToGroup: Record<string, Group> = {};

      groups.forEach((g) => {
        groupIdToGroup[g.id] = g;
      });

      const sortedGroups = groupIds.map((id) => groupIdToGroup[id]);
      return sortedGroups;
    });

    return groupLoader;
  }
}
