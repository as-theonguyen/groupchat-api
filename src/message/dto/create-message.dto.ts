import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class CreateMessageInput {
  @IsNotEmpty()
  @Field()
  content: string;

  @IsUUID()
  @Field(() => ID)
  groupId: string;
}
