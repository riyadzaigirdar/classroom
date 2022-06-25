import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReqUserTokenPayloadDto, ServiceResponseDto } from 'src/common/dto';
import { USERROLE_TYPE } from 'src/common/enums';
import { IsNull, Not, Repository } from 'typeorm';
import { UpdateEnrolledStudentDto } from '../dtos/update-enrolled-student.dto';
import { EnrolledStudent } from '../entities/enrolled-students.entity';

@Injectable()
export class EnrolledStudentService {
  constructor(
    @InjectRepository(EnrolledStudent)
    private enrolledStudentRepository: Repository<EnrolledStudent>,
  ) {}

  async updateEnrolledStudent(
    enrollId: number,
    body: UpdateEnrolledStudentDto,
  ): Promise<ServiceResponseDto> {
    let foundEnroll = await this.enrolledStudentRepository.findOne({
      where: { id: enrollId },
    });

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

  async getResults(
    reqUser: ReqUserTokenPayloadDto,
  ): Promise<ServiceResponseDto> {
    let filter = {
      curatedResult: Not(IsNull()),
    };

    if (reqUser.role == USERROLE_TYPE.STUDENT) {
      filter['studentId'] = reqUser.id;
    }

    let enrolledClassesResult: EnrolledStudent[] =
      await this.enrolledStudentRepository.find({
        where: filter,
      });

    return {
      data: enrolledClassesResult,
      message: 'Successfully get results',
    };
  }
}
