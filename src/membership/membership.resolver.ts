import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { MembershipService } from './membership.service';
import { Membership } from './membership.type';

@Resolver()
export class MembershipResolver {
  constructor(private readonly membershipService: MembershipService) {}

  @Query(() => String)
  async getInviteToken() {}

  @Mutation(() => Membership)
  async join() {}

  @Mutation(() => Boolean)
  async leave() {}
}
