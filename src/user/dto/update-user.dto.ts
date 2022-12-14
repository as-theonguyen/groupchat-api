import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';

@InputType()
export class UpdateUserInput {
  @IsUUID()
  @Field(() => ID)
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
