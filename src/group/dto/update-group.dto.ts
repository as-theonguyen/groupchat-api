import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateGroupInput {
  @IsUUID()
  @Field(() => ID)
  id: string;

  @IsNotEmpty()
  @Field()
  name: string;
}
