import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getManager, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { ClassRoom } from '../entities/classroom.entity';
import { CreateClassRoomDto } from '../dtos/create-classroom.dto';
import { ReqUserTokenPayloadDto, ServiceResponseDto } from 'src/common/dto';
import { USERROLE_TYPE } from 'src/common/enums';
import { EnrollStudentDto } from '../dtos/enroll-student.dto';
import { UserService } from 'src/modules/user/services/user.service';
import { EnrolledStudent } from '../entities/enrolled_students.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { UpdateClassRoomDto } from '../dtos/update-classroom.dto';

@Injectable()
export class ClassRoomService {
  constructor(
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
    @InjectRepository(EnrolledStudent)
    private enrolledStudentRepository: Repository<EnrolledStudent>,
    private readonly userService: UserService,
  ) {}

  async createClassRoom(
    reqUser: ReqUserTokenPayloadDto,
    body: CreateClassRoomDto,
  ): Promise<ServiceResponseDto> {
    if (
      await this.classRoomRepository.findOne({
        where: { className: body.className, subjectName: body.subjectName },
      })
    )
      throw new BadRequestException(
        'Classroom with that class name or subject name already exists',
      );

    if (reqUser.role === USERROLE_TYPE.ADMIN && !body.teacherId) {
      throw new BadRequestException('Must provide teacher id in request body');
    }

    if (
      body.teacherId &&
      !(await this.userService.getUser({
        id: body.teacherId,
        role: USERROLE_TYPE.TEACHER,
      }))
    ) {
      throw new NotFoundException('Teacher with that id not found');
    }

    let teacherId =
      reqUser.role === USERROLE_TYPE.ADMIN ? body.teacherId : reqUser.id;

    let newClassRoom = await this.classRoomRepository.save(
      await this.classRoomRepository.create({
        ...body,
        createdById: reqUser.id,
        teacherId,
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
    reqUser: ReqUserTokenPayloadDto,
    page: number,
    count: number,
  ): Promise<ServiceResponseDto> {
    let baseQuery = this.classRoomRepository
      .createQueryBuilder('classroom')
      .loadRelationCountAndMap(
        'classroom.enrolledStudents',
        'classroom.enrolled_students',
        'enrolled',
      )
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
        'classroom.status as "classStatus"',
        'teacher.fullName as "teacher"',
        'createdBy.fullName as "createdBy"',
      ])
      .limit(count)
      .offset((page - 1) * count)
      .orderBy('classroom.createdAt', 'DESC')
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

    if (!foundClassRoom) throw new NotFoundException('Invalid invite code');

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
      if (error instanceof BadRequestException)
        throw new BadRequestException(error['message']);

      if (error instanceof ForbiddenException)
        throw new ForbiddenException(error['message']);

      throw new BadRequestException(
        'Something went wrong! Please try again later',
      );
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

  async updateClassRoom(
    reqUser: ReqUserTokenPayloadDto,
    classRoomId: number,
    body: Partial<UpdateClassRoomDto>,
  ): Promise<ServiceResponseDto> {
    let foundClassRoom = await this.classRoomRepository.findOne({
      where: { id: classRoomId },
    });

    if (!foundClassRoom)
      throw new BadRequestException('Classroom with that id not found');

    if (
      reqUser.role === USERROLE_TYPE.TEACHER &&
      foundClassRoom.teacherId !== reqUser.id
    )
      throw new ForbiddenException(
        'Teacher not permitted to update this classroom',
      );

    Object.keys(body).map((item) => {
      foundClassRoom[item] = body[item];
    });

    let classSaved = await this.classRoomRepository.save(foundClassRoom);

    return {
      data: {
        id: classSaved.id,
        className: classSaved.className,
        subjectName: classSaved.subjectName,
        status: classSaved.status,
        inviteCode: classSaved.inviteCode,
        createdBy: classSaved.createdBy,
      },
      message: 'Successfully updated classroom',
    };
  }

  async listEnrolledStudentsOfClassRoom(
    reqUser: ReqUserTokenPayloadDto,
    classRoomId: number,
    page: number,
    count: number,
  ): Promise<ServiceResponseDto> {
    let foundClassRoom = await this.classRoomRepository.findOne({
      where: { id: classRoomId },
    });

    if (!foundClassRoom) {
      throw new NotFoundException('Class room with that id not found');
    }

    if (
      reqUser.role === USERROLE_TYPE.TEACHER &&
      foundClassRoom.teacherId !== reqUser.id
    ) {
      throw new ForbiddenException(
        'Teacher is not permitted to access this information',
      );
    }

    let baseQuery = this.enrolledStudentRepository
      .createQueryBuilder('enrolled')
      .leftJoinAndSelect('enrolled.classRoom', 'classRoom')
      .leftJoinAndSelect('enrolled.student', 'student')
      .where('enrolled.classRoomId = :classRoomId', { classRoomId });

    let total = await baseQuery.getCount();

    let result = await baseQuery
      .select([
        'classRoom.id as "classRoomId"',
        'classRoom.className as "className"',
        'classRoom.subjectName as "subjectName"',
        'student.id as "studentUserId"',
        'student.fullName "studentFullName"',
        'student.email "studentEmail"',
      ])
      .limit(count)
      .offset((page - 1) * count)
      .orderBy('order.createdAt', 'DESC')
      .getRawMany();

    return {
      data: {
        total,
        result,
      },
      message: 'Successfully listed enrolled students of class',
    };
  }
}
