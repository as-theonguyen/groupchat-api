import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { v4 } from 'uuid';

type GroupType = {
  id: string;
  name: string;
};

export const groupFactory = Factory.define<GroupType>(() => {
  return {
    id: v4(),
    name: faker.company.name(),
  };
});
