import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { v4 } from 'uuid';

type MessageType = {
  id: string;
  content: string;
  userId: string;
  groupId: string;
};

export const messageFactory = Factory.define<MessageType>(({ params }) => {
  return {
    id: v4(),
    content: faker.lorem.words(),
    groupId: params.groupId,
    userId: params.userId,
  };
});
