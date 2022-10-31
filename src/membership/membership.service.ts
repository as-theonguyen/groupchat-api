import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { Knex } from 'knex';
import { v4 } from 'uuid';
import { GetInviteTokenInput } from './dto/get-invite-token.dto';
import { JoinInput } from './dto/join.dto';
import { LeaveInput } from './dto/leave.dto';

@Injectable()
export class MembershipService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async getInviteToken({ groupId }: GetInviteTokenInput) {
    const token = await this.jwtService.signAsync(
      { groupId },
      { secret: this.configService.get('jwtSecret'), expiresIn: '10m' }
    );

    return token;
  }

  async join({ inviteToken, userId }: JoinInput) {
    try {
      const payload = await this.jwtService.verifyAsync(inviteToken, {
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

  async leave({ userId, groupId }: LeaveInput) {
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
