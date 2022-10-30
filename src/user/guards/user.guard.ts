import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class UserGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);

    const args = ctx.getArgs();
    const graphQLContext = ctx.getContext();

    if (!graphQLContext.user) {
      throw new Error('Unauthorized');
    }

    if (args.input.id !== graphQLContext.user.id) {
      throw new Error('Unauthorized');
    }

    return true;
  }
}
