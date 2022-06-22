import configuration from '../../config';
import { CacheModule, Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import * as redisStore from 'cache-manager-redis-store';
import { UserController } from './controllers/user.controller';
import { RedisCacheService } from './services/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.register({
      store: redisStore,
      ...configuration().redis,
    }),
  ],
  controllers: [UserController],
  providers: [UserService, RedisCacheService],
})
export class UserModule {}
