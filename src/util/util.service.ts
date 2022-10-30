import { Injectable } from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { User } from '@src/user/user.type';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';

@Injectable()
export class UtilService {
  constructor(private readonly userService: UserService) {}

  generateRandomToken() {
    return new Promise<string>((resolve, reject) => {
      randomBytes(48, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          const token = buf.toString('base64');
          resolve(token);
        }
      });
    });
  }

  async buildGraphQLContext(req: Request, res: Response) {
    let user: User | null;

    const { authorization } = req.headers;

    if (!authorization) {
      user = null;
    } else {
      user = await this.userService.findByToken(authorization);
    }

    return {
      req,
      res,
      user,
    };
  }
}
