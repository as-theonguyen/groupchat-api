import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
  Subscription,
} from '@nestjs/graphql';
import { AuthGqlGuard } from '@src/auth/guards/auth.gql-guard';
import { GraphQLContext } from '@src/graphql/types';
import { Group } from '@src/group/group.type';
import { MemberGuard } from '@src/membership/guards/member.guard';
import { PUB_SUB } from '@src/pubsub/pubsub.module';
import { User } from '@src/user/user.type';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { CreateMessageInput } from './dto/create-message.dto';
import { FindByGroupInput } from './dto/find-by-group.dto';
import { MessageAddedInput } from './dto/message-added.dto';
import { MessageInput } from './dto/message.dto';
import { MessageGuard } from './guards/message.guard';
import { MessageService } from './message.service';
import { Message } from './message.type';

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private readonly messageService: MessageService,
    @Inject(PUB_SUB) private readonly pubsub: RedisPubSub
  ) {}

  @ResolveField(() => User)
  user(@Root() message: Message, @Context() { userLoader }: GraphQLContext) {
    return userLoader.load(message.userId);
  }

  @ResolveField(() => Group)
  group(@Root() message: Message, @Context() { groupLoader }: GraphQLContext) {
    return groupLoader.load(message.groupId);
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
    this.pubsub.publish('messageAdded', message);
    return message;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGqlGuard, MessageGuard)
  async removeMessage(@Args('input') input: MessageInput) {
    const result = await this.messageService.remove(input);
    return result;
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => {
      return payload.groupId === variables.input.groupId;
    },
    resolve: (value) => value,
  })
  @UseGuards(AuthGqlGuard, MemberGuard)
  messageAdded(@Args('input') _: MessageAddedInput) {
    return this.pubsub.asyncIterator('messageAdded');
  }
}
