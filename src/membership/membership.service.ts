import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { Knex } from 'knex';
import { v4 } from 'uuid';

@Injectable()
export class MembershipService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async getInviteToken(groupId: string) {
    const token = await this.jwtService.signAsync(
      { groupId },
      { secret: this.configService.get('jwtSecret'), expiresIn: '10m' }
    );

    return token;
  }

  async join(userId: string, token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwtSecret'),
      });

      const id = v4();

      const [membership] = await this.knex('memberships')
        .insert({
          id,
          userId,
          groupId: payload.groupId,
        })
        .returning('*');

      return membership;
    } catch (error) {
      throw new Error('Invalid invite token');
    }
  }

  async leave(userId: string, groupId: string) {
    try {
      await this.knex('memberships')
        .delete()
        .where({ userId })
        .andWhere({ groupId });

      return true;
    } catch (error) {
      return false;
    }
  }
}
