import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Group {
  @Field()
  id: string;

  @Field()
  name: string;
}
