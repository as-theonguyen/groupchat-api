import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { AuthGqlGuard } from '@src/auth/guards/auth.gql-guard';
import { Group } from '@src/group/group.type';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { User } from '@src/user/user.type';
import { Knex } from 'knex';
import { GetInviteTokenInput } from './dto/get-invite-token.dto';
import { JoinInput } from './dto/join.dto';
import { LeaveInput } from './dto/leave.dto';
import { MemberGuard } from './guards/member.guard';
import { MembershipService } from './membership.service';
import { Membership } from './membership.type';

@Resolver(() => Membership)
export class MembershipResolver {
  constructor(
    private readonly membershipService: MembershipService,
    @Inject(KNEX_CONNECTION) private readonly knex: Knex
  ) {}

  @ResolveField(() => User)
  async user(@Root() membership: Membership) {
    const [user] = await this.knex
      .select('u.*')
      .from('users as u')
      .join('memberships as m', 'm.userId', '=', 'u.id')
      .where('u.id', '=', membership.userId);

    return user;
  }

  @ResolveField(() => Group)
  async group(@Root() membership: Membership) {
    const [group] = await this.knex
      .select('g.*')
      .from('groups as g')
      .join('memberships as m', 'm.groupId', '=', 'g.id')
      .where('g.id', '=', membership.groupId);

    return group;
  }

  @Query(() => String)
  @UseGuards(AuthGqlGuard, MemberGuard)
  async getInviteToken(@Args('input') input: GetInviteTokenInput) {
    const iniviteToken = await this.membershipService.getInviteToken(input);
    return iniviteToken;
  }

  @Mutation(() => Membership)
  @UseGuards(AuthGqlGuard)
  async join(@Args('input') input: JoinInput) {
    const membership = await this.membershipService.join(input);
    return membership;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGqlGuard, MemberGuard)
  async leave(@Args('input') input: LeaveInput) {
    const result = await this.membershipService.leave(input);
    return result;
  }
}
