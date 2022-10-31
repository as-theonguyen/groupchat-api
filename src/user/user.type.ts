import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Membership } from '@src/membership/membership.type';
import { Message } from '@src/message/message.type';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field(() => [Membership], { nullable: 'items' })
  memberships: Membership[];

  @Field(() => [Message], { nullable: 'items' })
  messages: Message[];
}
