import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ResponseDto {
  code: number;
  success: boolean;
  message: string;
  data: object;
}
export class ReqUserTokenPayloadDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

export class ServiceResponseDto {
  message: string;
  data: object;
}
