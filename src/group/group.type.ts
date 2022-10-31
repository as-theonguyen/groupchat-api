import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Membership } from '@src/membership/membership.type';
import { Message } from '@src/message/message.type';

@ObjectType()
export class Group {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [Membership], { nullable: 'items' })
  memberships: Membership[];

  @Field(() => [Message], { nullable: 'items' })
  messages: Message[];
}
