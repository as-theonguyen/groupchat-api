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
import { Group } from '@src/group/group.type';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { MemberGuard } from '@src/membership/guards/member.guard';
import { User } from '@src/user/user.type';
import { Knex } from 'knex';
import { CreateMessageInput } from './dto/create-message.dto';
import { FindByGroupInput } from './dto/find-by-group.dto';
import { MessageInput } from './dto/message.dto';
import { MessageGuard } from './guards/message.guard';
import { MessageService } from './message.service';
import { Message } from './message.type';

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private readonly messageService: MessageService,
    @Inject(KNEX_CONNECTION) private readonly knex: Knex
  ) {}

  @ResolveField(() => User)
  async user(@Root() message: Message) {
    const [user] = await this.knex
      .select('u.*')
      .from('users as u')
      .join('messages as ms', 'ms.userId', '=', 'u.id')
      .where('u.id', '=', message.userId);

    return user;
  }

  @ResolveField(() => Group)
  async group(@Root() message: Message) {
    const [group] = await this.knex
      .select('g.*')
      .from('groups as g')
      .join('messages as ms', 'ms.groupId', '=', 'g.id')
      .where('g.id', '=', message.groupId);

    return group;
  }

  @Query(() => [Message], { nullable: 'items' })
  @UseGuards(AuthGqlGuard, MemberGuard)
  async messages(@Args('input') input: FindByGroupInput) {
    const messages = await this.messageService.findByGroup(input);
    return messages;
  }

  @Mutation(() => Message)
  @UseGuards(AuthGqlGuard, MemberGuard)
  async createMessage(
    @Args('input') input: CreateMessageInput,
    @Context() { user }: GraphQLContext
  ) {
    const message = await this.messageService.create(user.id, input);
    return message;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGqlGuard, MessageGuard)
  async removeMessage(@Args('input') input: MessageInput) {
    const result = await this.messageService.remove(input);
    return result;
  }
}
