import { AuthorizeGuard } from 'src/common/guard';
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
import { Permissions } from 'src/common/decorator/controller.decorator';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { ReqUser } from 'src/common/decorator/param.decortor';
import { SubmissionService } from '../../services/submission.service';
import { QueryListSubmissionDto } from '../../dtos/query-list-submission.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { submissionMulterConfig } from 'src/common/multer';
import { UpdateSubmissionDto } from '../../dtos/update-submission.dto';
import { CreateSubmissionDto } from '../../dtos/create-submission.dto';

@UseGuards(AuthorizeGuard)
@Permissions('submission', ['admin'])
@Controller('admin/submission')
export class AdminSubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get('')
  async listSubmissions(
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

  @Post('')
  async createSubmission(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Body() body: CreateSubmissionDto,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.submissionService.createSubmission(reqUser, body);
    return {
      code: 200,
      success: true,
      message: null,
      data: null,
    };
  }

  @HttpCode(200)
  @Post(':submissionId/submit-file')
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
