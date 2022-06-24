import { IsDefined, IsEmail, IsString } from 'class-validator';
import { CREATE_USERROLE_TYPE } from 'src/common/enums';

export class CreateTeacherDto {
  @IsDefined()
  @IsString()
  fullName: string;

  @IsDefined()
  @IsEmail()
  email: string;
}
