import configuration from '../../config';
import { CacheModule, Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { UserService } from './services/user.service';
import * as redisStore from 'cache-manager-redis-store';
import { UserController } from './controllers/user.controller';
import { RedisCacheService } from './services/redis.service';

import { AdminUserController } from './controllers/admin.controller';
import { PublicUserController } from './controllers/public.user.controller';
import { EmailService } from '../email/services/email.service';
import { StudentMeta } from './entities/student_meta';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, StudentMeta]),
    CacheModule.register({
      store: redisStore,
      ...configuration().redis,
    }),
    EmailModule,
  ],
  controllers: [AdminUserController, PublicUserController, UserController],
  providers: [UserService, RedisCacheService, EmailService],
  exports: [UserService],
})
export class UserModule {}
