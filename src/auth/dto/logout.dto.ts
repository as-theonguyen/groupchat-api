import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean } from 'class-validator';

@InputType()
export class LogoutInput {
  @IsBoolean()
  @Field()
  all: boolean;
}
