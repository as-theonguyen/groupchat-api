import { Factory } from 'fishery';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';

type UserTokenType = {
  id: string;
  value: string;
  context: string;
  userId: string;
};

export const tokenFactory = Factory.define<UserTokenType>(({ params }) => {
  return {
    id: v4(),
    value: faker.random.alphaNumeric(32),
    context: params.context,
    userId: params.userId,
  };
});
