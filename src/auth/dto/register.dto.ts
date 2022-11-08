import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @IsEmail()
  @Field()
  email: string;

  @IsNotEmpty()
  @Field()
  username: string;

  @MinLength(8)
  @Field()
  password: string;
}
