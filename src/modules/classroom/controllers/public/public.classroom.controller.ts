import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AllowAnonymous } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { AuthorizeGuard } from 'src/common/guard';
import { EnrollStudentDto } from '../../dtos/enroll-student.dto';
import { ClassRoomService } from '../../services/classroom.service';

@UseGuards(AuthorizeGuard)
@AllowAnonymous('classroom')
@Controller('public/classroom')
export class PublicClassRoomController {
  constructor(private readonly classRoomService: ClassRoomService) {}

  @Post('/:classInviteCode/enroll')
  async enrollStudentToClassRoom(
    @Param('classInviteCode') classInviteCode: string,
    @Body() body: EnrollStudentDto,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.classRoomService.enrollStudentToClassRoom(
        classInviteCode,
        body,
      );

    return {
      code: 201,
      success: true,
      message,
      data,
    };
  }
}
