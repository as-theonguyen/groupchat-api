import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import configuration from '@src/config/configuration';
import knexConfig from '@src/config/knexfile';
import { KnexModule } from '@src/knex/knex.module';
import { UserModule } from '@src/user/user.module';
import { AuthModule } from '@src/auth/auth.module';
import { UtilModule } from '@src/util/util.module';
import { UtilService } from '@src/util/util.service';
import { GroupModule } from './group/group.module';
import { MembershipModule } from './membership/membership.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get('env');
        const knexOptions = knexConfig[env];
        return knexOptions;
      },
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [UtilModule],
      inject: [UtilService],
      useFactory: (utilService: UtilService) => {
        return {
          cors: false,
          path: '/api/graphql',
          autoSchemaFile: join(
            process.cwd(),
            'src',
            'graphql',
            'schema.graphql'
          ),
          sortSchema: true,
          context: async ({ req, res }) => {
            const ctx = await utilService.buildGraphQLContext(req, res);
            return ctx;
          },
        };
      },
    }),
    UserModule,
    AuthModule,
    UtilModule,
    GroupModule,
    MembershipModule,
    MessageModule,
  ],
})
export class AppModule {}
