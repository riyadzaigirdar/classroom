import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { SUBMISSION_STATUS_TYPE } from 'src/common/enums';

export class UpdateSubmissionDto {
  @IsOptional()
  @IsNumber()
  obtainedMarks: number;

  @IsOptional()
  @IsEnum(SUBMISSION_STATUS_TYPE, {
    message:
      'Submission status must be one of pending, submitted, examined, expired',
  })
  status: SUBMISSION_STATUS_TYPE;
}
