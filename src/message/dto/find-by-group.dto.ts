import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class GroupMessagesFieldInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  offset?: number;
}

@InputType()
export class FindByGroupInput extends GroupMessagesFieldInput {
  @IsUUID()
  @Field(() => ID)
  groupId: string;
}
