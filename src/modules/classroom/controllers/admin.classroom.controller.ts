import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';
import { ReqUserTokenPayload, ServiceResponseDto } from 'src/common/dto';

import { AuthorizeGuard } from '../../../common/guard';
import { ClassRoomService } from '../services/classroom.service';

@UseGuards(AuthorizeGuard)
@Permissions('classroom', ['admin'])
@Controller('admin')
export class AdminClassRoomController {
  constructor(private readonly classRoomService: ClassRoomService) {}

  @Get('classroom')
  async listClassRoom(
    @ReqUser() reqUser: ReqUserTokenPayload,
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
}
