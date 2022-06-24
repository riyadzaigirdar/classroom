import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AllowAnonymous } from 'src/common/decorator/controller.decorator';
import { ResponseDto, ServiceResponseDto } from 'src/common/dto';
import { AuthorizeGuard } from 'src/common/guard';
import { LoginRequestBodyDto } from '../dtos/login.dto';
import { UserService } from '../services/user.service';

// ================== PUBLIC ROUTES (NO TOKEN NEEDED) =================== //

@UseGuards(AuthorizeGuard)
@AllowAnonymous('user')
@Controller('public/user')
export class PublicUserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(200)
  @Post('login')
  async loginUser(@Body() body: LoginRequestBodyDto): Promise<ResponseDto> {
    let { message, data }: ServiceResponseDto = await this.userService.login(
      body,
    );
    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }

  @HttpCode(200)
  @Put(':emailVerifyCode/verify-email')
  async verifyEmail(
    @Param('emailVerifyCode') emailVerifyCode: string,
  ): Promise<ResponseDto> {
    let { message, data }: ServiceResponseDto =
      await this.userService.verifyEmail(emailVerifyCode);
    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }
}
