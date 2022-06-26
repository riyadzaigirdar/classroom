import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReqUserTokenPayloadDto, ServiceResponseDto } from 'src/common/dto';
import { USERROLE_TYPE } from 'src/common/enums';
import { IsNull, Not, Repository } from 'typeorm';
import { UpdateResultDto } from '../dtos/update-enrolled-student.dto';
import { ClassRoom } from '../entities/classroom.entity';
import { EnrolledStudent } from '../entities/enrolled-students.entity';

@Injectable()
export class EnrolledStudentService {
  constructor(
    @InjectRepository(EnrolledStudent)
    private enrolledStudentRepository: Repository<EnrolledStudent>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
  ) {}

  async updateResult(
    reqUser: ReqUserTokenPayloadDto,
    enrollId: number,
    body: UpdateResultDto,
  ): Promise<ServiceResponseDto> {
    let foundEnroll = await this.enrolledStudentRepository.findOne({
      where: { id: enrollId },
    });

    if (
      reqUser.role !== USERROLE_TYPE.ADMIN &&
      !(await this.classRoomRepository.findOne({
        where: { id: foundEnroll.classRoomId, teacherId: reqUser.id },
      }))
    )
      throw new BadRequestException(
        'Teacher not permitted to access this information',
      );

    if (!foundEnroll)
      throw new NotFoundException('Enrollment with that id not found');

    foundEnroll.curatedResult = body.curatedResult;

    let saved: EnrolledStudent = await this.enrolledStudentRepository.save(
      foundEnroll,
    );

    return {
      message: 'Successfully updated curated result of enrolled student',
      data: saved,
    };
  }
}
