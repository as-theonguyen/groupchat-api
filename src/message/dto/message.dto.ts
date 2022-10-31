import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class MessageInput {
  @IsUUID()
  @Field(() => ID)
  id: string;
}
