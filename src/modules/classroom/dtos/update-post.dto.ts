import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { POST_TYPE } from 'src/common/enums';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends CreatePostDto {
  @Expose()
  @IsOptional()
  totalMarks: number;

  @Expose()
  @IsOptional()
  deadLine: Date;

  @Expose()
  @IsOptional()
  type: POST_TYPE;

  @IsOptional()
  @IsBoolean()
  resultPublished: boolean;
}
