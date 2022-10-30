import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateGroupInput {
  @IsUUID()
  @Field()
  id: string;

  @IsNotEmpty()
  @Field()
  name: string;
}
