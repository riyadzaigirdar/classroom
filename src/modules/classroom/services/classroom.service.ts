import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getManager, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { ClassRoom } from '../entities/classroom.entity';
import { CreateClassRoom } from '../dtos/create-classroom.dto';
import { ReqUserTokenPayload, ServiceResponseDto } from 'src/common/dto';
import { USERROLE_TYPE } from 'src/common/enums';
import { EnrollStudentDto } from '../dtos/enroll-student.dto';
import { UserService } from 'src/modules/user/services/user.service';
import { EnrolledStudent } from '../entities/enrolled_students.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class ClassRoomService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
    @InjectRepository(EnrolledStudent)
    private enrolledStudentRepository: Repository<EnrolledStudent>,
    private readonly userService: UserService,
  ) {}
  EnrolledStudent;
  async createClassRoom(
    reqUser: ReqUserTokenPayload,
    body: CreateClassRoom,
  ): Promise<ServiceResponseDto> {
    if (
      await this.classRoomRepository.findOne({
        where: { className: body.className, subjectName: body.subjectName },
      })
    )
      throw new BadRequestException(
        'Classroom with that class name or subject name already exists',
      );

    let newClassRoom = await this.classRoomRepository.save(
      await this.classRoomRepository.create({
        ...body,
        createdById: reqUser.id,
        teacherId: reqUser.id,
      }),
    );
    return {
      data: {
        id: newClassRoom.id,
        className: newClassRoom.className,
        subjectName: newClassRoom.subjectName,
        status: newClassRoom.status,
        inviteCode: newClassRoom.inviteCode,
        createdBy: newClassRoom.createdBy,
      },
      message: 'Successfully created classroom',
    };
  }

  async listClassRoom(
    reqUser: ReqUserTokenPayload,
    page: number,
    count: number,
  ): Promise<ServiceResponseDto> {
    let baseQuery = this.classRoomRepository
      .createQueryBuilder('classroom')
      .leftJoinAndSelect('classroom.createdBy', 'createdBy')
      .leftJoinAndSelect('classroom.teacher', 'teacher');

    if (reqUser.role === USERROLE_TYPE.TEACHER)
      baseQuery.where('classroom.teacherId = :teacherId', {
        teacherId: reqUser.id,
      });

    let total: number = await baseQuery.getCount();

    let result = await baseQuery
      .select([
        'classroom.id as "classroomId"',
        'classroom.className as "className"',
        'classroom.subjectName as "subjectName"',
        'classroom.inviteCode as "inviteCode"',
        'classroom.status as status',
        'teacher.fullName as teacher',
        'createdBy.fullName as createdBy',
      ])
      .limit(count)
      .offset((page - 1) * count)
      .getRawMany();

    return {
      data: {
        total,
        result,
      },
      message: `Successfully listed classroom`,
    };
  }

  async enrollStudentToClassRoom(
    classInviteCode: string,
    body: EnrollStudentDto,
  ): Promise<ServiceResponseDto> {
    let foundClassRoom = await this.classRoomRepository.findOne({
      where: { inviteCode: classInviteCode },
    });

    if (!foundClassRoom) throw new BadRequestException('Invalid invite code');

    let student: User;
    let enrolledStudent: EnrolledStudent;

    try {
      await getManager().transaction(async (entityManager) => {
        student = await this.userService.createOrGetStudent(
          entityManager,
          body,
        );

        if (
          await this.enrolledStudentRepository.findOne({
            where: { studentId: student.id, classRoomId: foundClassRoom.id },
          })
        ) {
          throw new BadRequestException('Student Already enrolled');
        }

        enrolledStudent = await entityManager.save(
          await this.enrolledStudentRepository.create({
            studentId: student.id,
            classRoomId: foundClassRoom.id,
          }),
        );
      });
    } catch (error) {
      throw new BadRequestException('Something went wrong! try again later');
    }

    return {
      data: {
        id: student.id,
        email: student.email,
        fullName: student.fullName,
        enrolledClassId: foundClassRoom.id,
      },
      message: 'Successfully enrolled to class',
    };
  }
}
