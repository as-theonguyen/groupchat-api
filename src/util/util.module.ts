import { Module } from '@nestjs/common';
import { UserModule } from '@src/user/user.module';
import { UtilService } from '@src/util/util.service';

@Module({
  imports: [UserModule],
  providers: [UtilService],
  exports: [UtilService],
})
export class UtilModule {}
