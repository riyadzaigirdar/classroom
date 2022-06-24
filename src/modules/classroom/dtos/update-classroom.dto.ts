import { IsEnum, IsString } from 'class-validator';
import { CLASSROOM_STATUS_TYPE } from 'src/common/enums';
import { CreateClassRoomDto } from './create-classroom.dto';

export class UpdateClassRoomDto extends CreateClassRoomDto {
  @IsString()
  inviteCode: string;

  @IsEnum(CLASSROOM_STATUS_TYPE, { message: 'class room status invalid' })
  status: CLASSROOM_STATUS_TYPE;
}
