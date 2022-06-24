import { DefaultValuePipe } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { USERROLE_TYPE } from 'src/common/enums';

export class ListUserQueryDto {
  @IsOptional()
  @IsEnum(USERROLE_TYPE, {
    message: "Role type doesn't match any of admin, student teacher",
  })
  role: USERROLE_TYPE;

  @IsNumber()
  @Transform(({ value }) => {
    return value ? value : 1;
  })
  page: number;

  @IsNumber()
  @Transform(({ value }) => {
    return value ? value : 10;
  })
  count: number;
}
