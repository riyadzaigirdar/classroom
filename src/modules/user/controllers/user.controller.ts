import {
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
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
import { ChangePassword } from '../dtos/change-password.dto';
import { UserService } from '../services/user.service';

@UseGuards(AuthorizeGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('change-password')
  @Permissions('classroom', ['teacher', 'student', 'admin'])
  @HttpCode(200)
  async changePassword(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Body() body: ChangePassword,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.userService.changePassword(reqUser, body);

    return {
      code: 201,
      success: true,
      message,
      data,
    };
  }
}
