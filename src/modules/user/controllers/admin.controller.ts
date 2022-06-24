import { AuthorizeGuard } from 'src/common/guard';
import { UserService } from '../services/user.service';
import { CreateTeacherDto } from '../dtos/createTeacher.dto';
import { ResponseDto, ServiceResponseDto } from 'src/common/dto';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Permissions } from '../../../common/decorator/controller.decorator';

@UseGuards(AuthorizeGuard)
@Permissions('user', ['admin'])
@Controller('admin/user')
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
}
