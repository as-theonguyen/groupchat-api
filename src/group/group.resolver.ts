import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { GroupService } from './group.service';
import { Group } from './group.type';

@Resolver()
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Query(() => [Group], { nullable: 'items' })
  async groups() {}

  @Query(() => Group)
  async group() {}

  @Mutation(() => Group)
  async createGroup() {}

  @Mutation(() => Group)
  async updateGroup() {}

  @Mutation(() => Boolean)
  async deleteGroup() {}
}
