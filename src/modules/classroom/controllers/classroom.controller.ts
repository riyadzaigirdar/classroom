import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { AuthorizeGuard } from 'src/common/guard';
import { CreateClassRoomDto } from '../dtos/create-classroom.dto';
import { EnrollStudentDto } from '../dtos/enroll-student.dto';
import { UpdateClassRoomDto } from '../dtos/update-classroom.dto';
import { ClassRoomService } from '../services/classroom.service';

@UseGuards(AuthorizeGuard)
@Controller('classroom')
export class ClassRoomController {
  constructor(private readonly classRoomService: ClassRoomService) {}

  @Post('/')
  @Permissions('classroom', ['teacher'])
  async createClassRoom(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Body() body: CreateClassRoomDto,
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

  @Put(':classRoomId')
  @Permissions('classroom', ['teacher'])
  async updateClassRoom(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Param('classRoomId') classRoomId: number,
    @Body() body: Partial<UpdateClassRoomDto>,
  ) {
    let { data, message }: ServiceResponseDto =
      await this.classRoomService.updateClassRoom(reqUser, classRoomId, body);

    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }

  @Get('/')
  @Permissions('classroom', ['teacher'])
  async listClassRoom(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
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

  @Get('/:classRoomId/post')
  @Permissions('classroom', ['teacher'])
  async getPostOfClass(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Param('classRoomId') classRoomId: number,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.classRoomService.getPost(reqUser, classRoomId);

    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }

  @Get('/enrolled-classes')
  @Permissions('classroom', ['student'])
  async getEnrolledClassesByStudent(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number = 10,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.classRoomService.enrolledClasses(reqUser, page, count);

    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }

  @Get(':classRoomId/enrolled-students')
  @Permissions('classroom', ['teacher'])
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
