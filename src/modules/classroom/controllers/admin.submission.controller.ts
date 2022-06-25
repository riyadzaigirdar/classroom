import { AuthorizeGuard } from 'src/common/guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/common/decorator/controller.decorator';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { ReqUser } from 'src/common/decorator/param.decortor';
import { SubmissionService } from '../services/submission.service';
import { QueryListSubmissionDto } from '../dtos/query-list-submission.dto';

@UseGuards(AuthorizeGuard)
@Permissions('submission', ['admin'])
@Controller('admin/submission')
export class AdminSubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get('')
  async listSubmimissions(
    @Query() query: QueryListSubmissionDto,
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
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
