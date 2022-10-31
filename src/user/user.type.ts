import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Membership } from '@src/membership/membership.type';

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
}
