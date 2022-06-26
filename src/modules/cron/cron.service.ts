import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SUBMISSION_STATUS_TYPE } from 'src/common/enums';
import { Repository } from 'typeorm';
import { Submission } from '../classroom/entities/submission.entity';
import { EmailService } from '../email/services/email.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    private readonly emailService: EmailService,
  ) {}

  @Cron('00 * * * * *')
  async handleCron() {
    let submissions = await this.submissionRepository.find({
      where: { status: SUBMISSION_STATUS_TYPE.PENDING },
    });

    let deadLine;
    let now = new Date().getTime();
    for (let i = 0; i < submissions.length; i++) {
      deadLine = new Date(submissions[i].post.deadLine).getTime();

      if ((deadLine - now) / 1000 / 60 / 60 === 24) {
        await this.emailService.sendPendingAssignmentOrExamReminder(
          submissions[i].assigned.email,
          submissions[i].post.type,
        );
      }
    }

    this.logger.debug('Every minute 00');
  }
}
