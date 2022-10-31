import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class LeaveInput {
  @IsUUID()
  @Field(() => ID)
  userId: string;

  @IsUUID()
  @Field(() => ID)
  groupId: string;
}
