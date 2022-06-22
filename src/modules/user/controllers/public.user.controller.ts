import { Body, Controller, Post } from '@nestjs/common';
import { ResponseDto, ServiceResponseDto } from 'src/common/dto';
import { LoginRequestBodyDto } from '../dtos/login.dto';
import { UserService } from '../services/user.service';

@Controller('public')
export class PublicUserController {
  constructor(private readonly userService: UserService) {}

  @Post('user/login')
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
}
