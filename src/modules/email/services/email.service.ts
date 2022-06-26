import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor() {}

  sendPasswordToEmail(email: string, password: string) {
    Logger.verbose(`Password: ${password} sent to Email: ${email}`);
  }

  sendEmailVerifyCode(email: string, emailVerifyCode: string) {
    Logger.verbose(
      `Email Verify Code: ${emailVerifyCode} sent to Email: ${email}`,
    );
  }

  sendClassEnviteCode(emails: string[], inviteCode: string) {
    Logger.verbose(
      `Invite Code: ${inviteCode} sent to multiple Emails: ${emails.map(
        (item) => `${item},`,
      )}`,
    );
  }

  sendPendingAssignmentOrExamReminder(email: string, type: string) {
    Logger.verbose(`Pending ${type} sent to  Email: ${email}`);
  }
}
