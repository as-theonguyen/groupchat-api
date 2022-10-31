import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { MessageService } from '../message.service';

@Injectable()
export class MessageGuard implements CanActivate {
  constructor(private readonly messageService: MessageService) {}

  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    const args = ctx.getArgs();

    const message = await this.messageService.findById({ id: args.input.id });

    if (gqlContext.user.id !== message.userId) {
      throw new Error('Unauthorized');
    }

    return true;
  }
}
