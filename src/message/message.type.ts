import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Group } from '@src/group/group.type';
import { User } from '@src/user/user.type';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  user: User;

  @Field(() => Group)
  group: Group;

  userId: string;

  groupId: string;
}
