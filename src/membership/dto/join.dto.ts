import { Field, ID, InputType } from '@nestjs/graphql';
import { IsJWT, IsUUID } from 'class-validator';

@InputType()
export class JoinInput {
  @IsUUID()
  @Field(() => ID)
  userId: string;

  @IsJWT()
  @Field()
  inviteToken: string;
}
