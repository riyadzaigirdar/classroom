import { Transform } from 'class-transformer';
import { IsDefined, IsString, Length, Min } from 'class-validator';

export class ChangePassword {
  @IsDefined()
  @IsString()
  @Length(6)
  currentPassword: string;

  @IsDefined()
  @IsString()
  @Length(6)
  newPassword: string;

  @IsDefined()
  @IsString()
  @Length(6)
  retypeNewPassword: string;
}
