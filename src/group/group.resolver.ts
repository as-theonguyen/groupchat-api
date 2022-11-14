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
import { MemberGuard } from '@src/membership/guards/member.guard';
import { Membership } from '@src/membership/membership.type';
import { GroupMessagesFieldInput } from '@src/message/dto/find-by-group.dto';
import { MessageService } from '@src/message/message.service';
import { Message } from '@src/message/message.type';
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
    private readonly messageService: MessageService,
    @Inject(KNEX_CONNECTION) private readonly knex: Knex
  ) {}

  @ResolveField(() => [Membership], { nullable: 'items' })
  async memberships(@Root() group: Group) {
    const memberships = await this.knex('memberships')
      .select('*')
      .where('groupId', '=', group.id);

    return memberships;
  }

  @ResolveField(() => [Message], { nullable: 'items' })
  async messages(
    @Root() group: Group,
    @Args('input') input: GroupMessagesFieldInput
  ) {
    const messages = await this.messageService.findByGroup({
      groupId: group.id,
      ...input,
    });

    return messages;
  }

  @Query(() => Group)
  @UseGuards(AuthGqlGuard, MemberGuard)
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
