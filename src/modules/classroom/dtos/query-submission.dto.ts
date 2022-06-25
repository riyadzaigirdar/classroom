import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { SUBMISSION_STATUS_TYPE } from 'src/common/enums';

export class QuerySubmissionDto {
  @IsOptional()
  @IsEnum(SUBMISSION_STATUS_TYPE, {
    message:
      'Submission status must be one of pending, submitted, examined, expired',
  })
  status: SUBMISSION_STATUS_TYPE;

  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  count: number = 10;
}
