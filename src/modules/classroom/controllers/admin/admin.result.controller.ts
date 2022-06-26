import { AuthorizeGuard } from 'src/common/guard';
import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { EnrolledStudentService } from '../../services/result.service';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';
import { UpdateResultDto } from '../../dtos/update-enrolled-student.dto';

@UseGuards(AuthorizeGuard)
@Controller('admin/result')
@Permissions('result', ['admin'])
export class ResultController {
  constructor(private readonly enrollStudentService: EnrolledStudentService) {}

  @Put(':enrollId')
  async updateResults(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Param('enrollId') enrollId: number,
    @Body() body: UpdateResultDto,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.enrollStudentService.updateResult(reqUser, enrollId, body);
    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }
}
