import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLContext } from '@src/graphql/types';
import { User } from '@src/user/user.type';
import { UserService } from '@src/user/user.service';
import { UpdateUserInput } from '@src/user/dto/update-user.dto';
import { UserGuard } from '@src/user/guards/user.guard';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  me(@Context() { user }: GraphQLContext) {
    return user;
  }

  @Mutation(() => User)
  @UseGuards(UserGuard)
  async updateUser(@Args('input') input: UpdateUserInput) {
    const updatedUser = await this.userService.updateOne(input);
    return updatedUser;
  }
}
