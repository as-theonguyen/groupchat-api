import { Module } from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { UtilModule } from '@src/util/util.module';
import { UserModule } from '@src/user/user.module';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [UtilModule, UserModule],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}
