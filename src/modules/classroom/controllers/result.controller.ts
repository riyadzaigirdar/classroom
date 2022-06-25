import { AuthorizeGuard } from 'src/common/guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { EnrolledStudentService } from '../services/enrolled-student.service';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';

@UseGuards(AuthorizeGuard)
@Controller('result')
export class ResultController {
  constructor(private readonly enrollStudentService: EnrolledStudentService) {}

  @Get('/')
  @Permissions('result', ['student', 'admin'])
  async getResults(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.enrollStudentService.getResults(reqUser);
    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }
}
