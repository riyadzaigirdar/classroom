import { IsDefined, IsString, Min } from 'class-validator';
import { CreateTeacherDto } from '../../user/dtos/createTeacher.dto';

export class EnrollStudentDto extends CreateTeacherDto {
  @IsDefined()
  @IsString()
  studentId: string;

  @IsDefined()
  @IsString()
  @Min(6)
  password: string;
}
