import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { AuthGqlGuard } from '@src/auth/guards/auth.gql-guard';
import { GraphQLContext } from '@src/graphql/types';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { Membership } from '@src/membership/membership.type';
import { Knex } from 'knex';
import { CreateGroupInput } from './dto/create-group.dto';
import { GroupInput } from './dto/group.dto';
import { UpdateGroupInput } from './dto/update-group.dto';
import { GroupService } from './group.service';
import { Group } from './group.type';
import { GroupAdminGuard } from './guards/group-admin.guard';

@Resolver(() => Group)
export class GroupResolver {
  constructor(
    private readonly groupService: GroupService,
    @Inject(KNEX_CONNECTION) private readonly knex: Knex
  ) {}

  @ResolveField(() => [Membership], { nullable: 'items' })
  async memberships(@Root() group: Group) {
    const memberships = await this.knex
      .select('m.*')
      .from('memberships as m')
      .join('groups as g', 'm.groupId', '=', 'g.id')
      .where('m.groupId', '=', group.id);

    return memberships;
  }

  @Query(() => [Group], { nullable: 'items' })
  async groups() {
    const allGroups = await this.groupService.findAll();
    return allGroups;
  }

  @Query(() => Group)
  async group(@Args('input') input: GroupInput) {
    const group = await this.groupService.findById(input.id);
    return group;
  }

  @Mutation(() => Group)
  @UseGuards(AuthGqlGuard)
  async createGroup(
    @Args('input') input: CreateGroupInput,
    @Context() { user }: GraphQLContext
  ) {
    const group = await this.groupService.create(user.id, input);
    return group;
  }

  @Mutation(() => Group)
  @UseGuards(AuthGqlGuard, GroupAdminGuard)
  async updateGroup(@Args('input') input: UpdateGroupInput) {
    const updatedGroup = await this.groupService.update(input);
    return updatedGroup;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGqlGuard, GroupAdminGuard)
  async removeGroup(@Args('input') input: GroupInput) {
    const result = await this.groupService.remove(input.id);
    return result;
  }
}
