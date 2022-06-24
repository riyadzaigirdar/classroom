import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateClassRoomDto {
  @IsDefined()
  @IsString()
  className: string;

  @IsDefined()
  @IsString()
  subjectName: string;

  @IsOptional()
  @IsNumber()
  teacherId: number;
}
