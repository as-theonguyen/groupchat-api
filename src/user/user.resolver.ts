import {
  Args,
  Context,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { GraphQLContext } from '@src/graphql/types';
import { User } from '@src/user/user.type';
import { UserService } from '@src/user/user.service';
import { UpdateUserInput } from '@src/user/dto/update-user.dto';
import { UserGuard } from '@src/user/guards/user.guard';
import { Membership } from '@src/membership/membership.type';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { Knex } from 'knex';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    @Inject(KNEX_CONNECTION) private readonly knex: Knex
  ) {}

  @ResolveField(() => [Membership], { nullable: 'items' })
  async memberships(@Root() user: User) {
    const memberships = await this.knex
      .select('m.*')
      .from('memberships as m')
      .join('users as u', 'm.userId', '=', 'u.id')
      .where('m.userId', '=', user.id);

    return memberships;
  }

  @Query(() => User, { nullable: true })
  me(@Context() { user }: GraphQLContext) {
    return user;
  }

  @Mutation(() => User)
  @UseGuards(UserGuard)
  async updateUser(@Args('input') input: UpdateUserInput) {
    const updatedUser = await this.userService.update(input);
    return updatedUser;
  }
}
