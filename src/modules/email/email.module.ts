import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';

@Module({
  providers: [EmailService],
})
export class EmailModule {}
