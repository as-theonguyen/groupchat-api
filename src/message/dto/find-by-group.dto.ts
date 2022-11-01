import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class FindByGroupInput {
  @IsUUID()
  @Field(() => ID)
  groupId: string;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  offset?: number;
}
