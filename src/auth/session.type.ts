import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@src/user/user.type';

@ObjectType()
export class Session {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
