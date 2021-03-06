import configuration from './config';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { CronModule } from './modules/cron/cron.module';
import { EmailModule } from './modules/email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClassroomModule } from './modules/classroom/classroom.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './common/filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: 'default',
      useFactory: async (config: ConfigService) => {
        return {
          ...config.get('database'),
          autoLoadEntities: true,
          retryDelay: 3000,
        };
      },
    }),
    UserModule,
    ClassroomModule,
    EmailModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
