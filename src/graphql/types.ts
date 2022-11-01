import { User } from '@src/user/user.type';

export type GraphQLContext = {
  user: User | null;
};
