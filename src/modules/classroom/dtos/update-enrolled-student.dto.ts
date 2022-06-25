import { IsDefined, IsNumber, Max, Min } from 'class-validator';

export class UpdateEnrolledStudentDto {
  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(100)
  curatedResult: number;
}
