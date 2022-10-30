import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @IsNotEmpty()
  @Field()
  id: string;

  @IsEmail()
  @IsOptional()
  @Field({ nullable: true })
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  @Field({ nullable: true })
  username?: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsOptional()
  @Field({ nullable: true })
  password?: string;

  @IsNotEmpty()
  @MinLength(8)
  @Field()
  currentPassword: string;
}
