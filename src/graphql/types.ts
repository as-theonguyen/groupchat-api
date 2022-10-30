import { Request, Response } from 'express';
import { User } from '@src/user/user.type';

export type GraphQLContext = {
  req: Request;
  res: Response;
  user: User | null;
};
