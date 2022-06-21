import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ClassroomModule } from './modules/classroom/classroom.module';
import { EmailModule } from './modules/email/email.module';
import { CronModule } from './modules/cron/cron.module';

@Module({
  imports: [UserModule, ClassroomModule, EmailModule, CronModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
