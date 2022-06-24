import { Controller, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { AuthorizeGuard } from 'src/common/guard';
import { ClassRoomService } from '../services/classroom.service';

@UseGuards(AuthorizeGuard)
@Permissions('classroom', ['teacher'])
@Controller('classroom')
export class ClassRoomController {
  constructor(private readonly classRoomService: ClassRoomService) {}
}
