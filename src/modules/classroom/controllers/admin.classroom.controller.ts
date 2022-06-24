import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';
import { ReqUserTokenPayloadDto, ServiceResponseDto } from 'src/common/dto';

import { AuthorizeGuard } from '../../../common/guard';
import { ClassRoomService } from '../services/classroom.service';

@UseGuards(AuthorizeGuard)
@Permissions('classroom', ['admin'])
@Controller('admin/classroom')
export class AdminClassRoomController {
  constructor(private readonly classRoomService: ClassRoomService) {}

  @Get('')
  async listClassRoom(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
  ) {
    let { data, message }: ServiceResponseDto =
      await this.classRoomService.listClassRoom(reqUser, page, count);

    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }

  @Get(':classRoomId/enrolled-students')
  async listEnrolledStudentsOfClassRoom(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Param('classRoomId') classRoomId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
  ) {
    let { data, message }: ServiceResponseDto =
      await this.classRoomService.listEnrolledStudentsOfClassRoom(
        reqUser,
        classRoomId,
        page,
        count,
      );

    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }
}
