import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { Knex } from 'knex';

@Injectable()
export class UserMembershipGuard implements CanActivate {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();
    const gqlContext = ctx.getContext();

    if (args.input.userId !== gqlContext.user.id) {
      throw new Error('Unauthorized');
    }

    return true;
  }
}
