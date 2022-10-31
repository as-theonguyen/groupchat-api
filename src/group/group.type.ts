import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Membership } from '@src/membership/membership.type';

@ObjectType()
export class Group {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [Membership], { nullable: 'items' })
  memberships: Membership[];
}
