import { AuthorizeGuard } from 'src/common/guard';
import { UserService } from '../services/user.service';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { ResponseDto, ServiceResponseDto } from 'src/common/dto';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Permissions } from '../../../common/decorator/controller.decorator';
import { ListUserQueryDto } from '../dtos/list-user-query.dto';
import { USERROLE_TYPE } from 'src/common/enums';
import { Validate } from 'class-validator';

@Controller('admin/user')
@UseGuards(AuthorizeGuard)
@Permissions('user', ['admin'])
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  async createTeacher(@Body() body: CreateTeacherDto): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.userService.createTeacher(body);

    return {
      code: 201,
      success: true,
      message,
      data,
    };
  }

  @Get('/')
  @HttpCode(200)
  async listUser(@Query() query: ListUserQueryDto): Promise<ResponseDto> {
    console.log(query);
    let { data, message }: ServiceResponseDto = await this.userService.listUser(
      query,
    );

    return {
      code: 201,
      success: true,
      message,
      data,
    };
  }
}
