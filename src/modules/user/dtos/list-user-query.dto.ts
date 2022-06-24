import { Transform } from 'class-transformer';
import { IsDefined, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { USERROLE_TYPE } from 'src/common/enums';

export class ListUserQueryDto {
  @IsOptional()
  @IsEnum(USERROLE_TYPE, {
    message: "Role type doesn't match any of admin, student teacher",
  })
  role: USERROLE_TYPE;

  @IsOptional()
  page: number = 1;

  @IsOptional()
  count: number = 10;
}
