import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

export const PUB_SUB = 'PUB_SUB';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get('redis.url');

        const publisher = new Redis(redisUrl);
        const subscriber = new Redis(redisUrl);

        const pubsub = new RedisPubSub({
          publisher,
          subscriber,
        });

        return pubsub;
      },
    },
  ],
  exports: [PUB_SUB],
})
export class PubsubModule {}
