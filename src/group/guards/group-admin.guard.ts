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
export class GroupAdminGuard implements CanActivate {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    const args = ctx.getArgs();

    const [membership] = await this.knex('memberships')
      .select('*')
      .where({ userId: gqlContext.user.id })
      .andWhere({ groupId: args.input.id });

    if (!membership) {
      throw new Error('Unauthorized');
    }

    if (!membership.admin) {
      throw new Error('Unauthorized');
    }

    return true;
  }
}
