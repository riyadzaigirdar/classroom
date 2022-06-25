import { IsNumber, IsOptional } from 'class-validator';
import { QuerySubmissionDto } from './query-submission.dto';

export class QueryListSubmissionDto extends QuerySubmissionDto {
  @IsOptional()
  @IsNumber()
  postId: number;
}
