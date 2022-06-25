import { IsDefined, IsNumber } from 'class-validator';

export class CreateSubmissionDto {
  @IsDefined()
  @IsNumber()
  postId: number;

  @IsDefined()
  @IsNumber()
  assignedId: number;
}
