import { AuthorizeGuard } from 'src/common/guard';
import { Permissions } from '../../../common/decorator/controller.decorator';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ResponseDto, ServiceResponseDto } from 'src/common/dto';
import { CreateTeacherDto } from '../dtos/createTeacher.dto';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
