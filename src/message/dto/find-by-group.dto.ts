import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class FindByGroupInput {
  @IsUUID()
  @Field(() => ID)
  groupId: string;
}
