import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ClassroomModule } from '../classroom/classroom.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ScheduleModule.forRoot(), ClassroomModule, EmailModule],
  providers: [CronService],
})
export class CronModule {}
