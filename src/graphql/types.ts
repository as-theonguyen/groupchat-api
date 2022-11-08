import { Group } from '@src/group/group.type';
import { User } from '@src/user/user.type';
import * as DataLoader from 'dataloader';
import { Request } from 'express';

export type GraphQLContext = {
  req: Request;
  user: User | null;
  userLoader: DataLoader<string, User>;
  groupLoader: DataLoader<string, Group>;
};
