import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';
import { MessageModule } from '@src/message/message.module';

@Module({
  imports: [MessageModule],
  providers: [GroupService, GroupResolver],
})
export class GroupModule {}
