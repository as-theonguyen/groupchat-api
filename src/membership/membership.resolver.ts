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
import { User } from '@src/user/user.type';
import { GetInviteTokenInput } from './dto/get-invite-token.dto';
import { JoinInput } from './dto/join.dto';
import { LeaveInput } from './dto/leave.dto';
import { MemberGuard } from './guards/member.guard';
import { UserMembershipGuard } from './guards/user-membership.guard';
import { MembershipService } from './membership.service';
import { Membership } from './membership.type';

@Resolver(() => Membership)
export class MembershipResolver {
  constructor(private readonly membershipService: MembershipService) {}

  @ResolveField(() => User)
  user(
    @Root() membership: Membership,
    @Context() { userLoader }: GraphQLContext
  ) {
    return userLoader.load(membership.userId);
  }

  @ResolveField(() => Group)
  group(
    @Root() membership: Membership,
    @Context() { groupLoader }: GraphQLContext
  ) {
    return groupLoader.load(membership.groupId);
  }

  @Query(() => String)
  @UseGuards(AuthGqlGuard, MemberGuard)
  async getInviteToken(@Args('input') input: GetInviteTokenInput) {
    const iniviteToken = await this.membershipService.getInviteToken(input);
    return iniviteToken;
  }

  @Mutation(() => Membership)
  @UseGuards(AuthGqlGuard, UserMembershipGuard)
  async join(@Args('input') input: JoinInput) {
    const membership = await this.membershipService.join(input);
    return membership;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGqlGuard, UserMembershipGuard)
  async leave(@Args('input') input: LeaveInput) {
    const result = await this.membershipService.leave(input);
    return result;
  }
}
