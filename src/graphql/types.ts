import { Group } from '@src/group/group.type';
import { User } from '@src/user/user.type';
import * as DataLoader from 'dataloader';

export type GraphQLContext = {
  user: User | null;
  userLoader: DataLoader<string, User>;
  groupLoader: DataLoader<string, Group>;
};
