import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { AuthorizeGuard } from 'src/common/guard';
import { QueryListSubmissionDto } from '../dtos/query-list-submission.dto';
import { SubmissionService } from '../services/submission.service';

@UseGuards(AuthorizeGuard)
@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get('')
  @Permissions('classroom', ['teacher', 'student'])
  async listSubmimissions(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Query() query: QueryListSubmissionDto,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.submissionService.listSubmissions(reqUser, query);
    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }
}
