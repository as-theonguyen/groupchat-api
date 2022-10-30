import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateGroupInput {
  @IsNotEmpty()
  @Field()
  name: string;
}
