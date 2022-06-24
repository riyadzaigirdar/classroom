import { Controller, Post, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ResponseDto } from 'src/common/dto';
import { AuthorizeGuard } from 'src/common/guard';
import { CreateClassRoom } from '../dtos/createClassroom.dto';
import { ClassRoomService } from '../services/classroom.service';

@UseGuards(AuthorizeGuard)
@Permissions('classroom', ['teacher'])
@Controller('classroom')
export class ClassRoomController {
  constructor(private readonly classRoomService: ClassRoomService) {}

  @Post('/')
  async createClassRoom(body: CreateClassRoom): Promise<ResponseDto> {
    return {
      code: 201,
      success: true,
      message: 'Successfully create classroom',
      data: null,
    };
  }
}
