import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsDate, IsDefined, IsEnum, IsNumber, Min } from 'class-validator';
import { POST_TYPE } from 'src/common/enums';

export class CreatePostDto {
  @IsDefined()
  @IsNumber()
  classRoomId: number;

  @IsDefined()
  @IsNumber()
  @Min(0)
  totalMarks: number;

  @IsDefined()
  @IsDate()
  @Transform(({ value }) => {
    let deadLine = new Date(value).getTime();
    let todayDate = new Date(new Date().toISOString()).getTime();

    if (deadLine - todayDate < 0)
      throw new BadRequestException('Deadline must not me past from today');

    if ((deadLine - todayDate) / 1000 / 60 / 60 < 24)
      throw new BadRequestException(
        'Dealline must be atleast 24 hours forward to current time',
      );
    return value;
  })
  deadLine: Date;

  @IsDefined()
  @IsEnum(POST_TYPE, { message: 'Type must be assignment, exam' })
  type: POST_TYPE;
}
