import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';
import {
  ReqUserTokenPayload,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { AuthorizeGuard } from 'src/common/guard';
import { CreateClassRoom } from '../dtos/createClassroom.dto';
import { ClassRoomService } from '../services/classroom.service';

@UseGuards(AuthorizeGuard)
@Permissions('classroom', ['teacher'])
@Controller('classroom')
export class ClassRoomController {
  constructor(private readonly classRoomService: ClassRoomService) {}

  @Post('/')
  async createClassRoom(
    @ReqUser() reqUser: ReqUserTokenPayload,
    @Body() body: CreateClassRoom,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.classRoomService.createClassRoom(reqUser, body);
    return {
      code: 201,
      success: true,
      message,
      data,
    };
  }

  @Get('/')
  async listClassRoom(
    @ReqUser() reqUser: ReqUserTokenPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
  ): Promise<ResponseDto> {
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
