import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { AuthorizeGuard } from 'src/common/guard';
import { submissionMulterConfig } from 'src/common/multer';
import { QueryListSubmissionDto } from '../dtos/query-list-submission.dto';
import { UpdateSubmissionDto } from '../dtos/update-submission.dto';
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

  @HttpCode(200)
  @Post(':submissionId/submit-file')
  @Permissions('classroom', ['student'])
  @UseInterceptors(FileInterceptor('file', submissionMulterConfig))
  async submitFileSubmission(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Param('submissionId', new ParseIntPipe()) submissionId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.submissionService.submitFileSubmission(
        reqUser,
        submissionId,
        file,
      );

    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }

  @Put(':submissionId')
  @Permissions('classroom', ['teacher'])
  async updateSubmittion(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Param('submissionId') submissionId: number,
    @Body() body: UpdateSubmissionDto,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.submissionService.updateSubmission(
        reqUser,
        submissionId,
        body,
      );

    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }
}
