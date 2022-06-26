import { IsDefined, IsString, Length, Min } from 'class-validator';
import { CreateTeacherDto } from '../../user/dtos/create-teacher.dto';

export class EnrollStudentDto extends CreateTeacherDto {
  @IsDefined()
  @IsString()
  studentId: string;

  @IsDefined()
  @IsString()
  @Length(6)
  password: string;
}
