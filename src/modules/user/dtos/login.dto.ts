import { IsDefined, IsEmail, IsString } from 'class-validator';

export class LoginRequestBodyDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  password: string;
}

export class LoginServiceData {
  accessToken: string;
  refreshToken: string;
}
