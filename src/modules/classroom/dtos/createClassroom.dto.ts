import { IsDefined, IsString } from 'class-validator';

export class CreateClassRoom {
  @IsDefined()
  @IsString()
  className: string;

  @IsDefined()
  @IsString()
  subjectName: string;
}
