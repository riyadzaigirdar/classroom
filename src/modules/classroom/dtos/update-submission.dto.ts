import { IsNumber, IsOptional } from 'class-validator';

export class UpdateSubmissionDto {
  @IsOptional()
  @IsNumber()
  obtainedMarks: number;
}
