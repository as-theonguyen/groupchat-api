import { Factory } from 'fishery';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';

type UserType = {
  id: string;
  email: string;
  username: string;
  password: string;
};

export const userFactory = Factory.define<UserType>(() => {
  return {
    id: v4(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
  };
});
