import { Req, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLContext } from '@src/graphql/types';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.dto';
import { LogoutInput } from './dto/logout.dto';
import { RegisterInput } from './dto/register.dto';
import { AuthGqlGuard } from './guards/auth.gql-guard';
import { Session } from './session.type';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Session)
  async register(@Args('input') input: RegisterInput) {
    const { user, accessToken } = await this.authService.register(input);
    return { user, accessToken };
  }

  @Mutation(() => Session)
  async login(@Args('input') input: LoginInput) {
    const { user, accessToken } = await this.authService.login(input);
    return { user, accessToken };
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGqlGuard)
  async logout(
    @Args('input') input: LogoutInput,
    @Context() { req }: GraphQLContext
  ) {
    let result: boolean;

    if (input.all) {
      result = await this.authService.logoutFromAllDevices(
        req.headers.authorization
      );
    } else {
      result = await this.authService.logout(req.headers.authorization);
    }

    return result;
  }
}
