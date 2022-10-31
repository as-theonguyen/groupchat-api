import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Group } from '@src/group/group.type';
import { User } from '@src/user/user.type';

@ObjectType()
export class Membership {
  @Field(() => ID)
  id: string;

  @Field(() => Boolean)
  admin: boolean;

  @Field(() => User)
  user: User;

  @Field(() => Group)
  group: Group;

  userId: string;

  groupId: string;
}
