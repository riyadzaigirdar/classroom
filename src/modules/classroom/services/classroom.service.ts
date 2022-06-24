import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { ClassRoom } from '../entities/classroom.entity';
import { Submission } from '../entities/submission.entity';
import { CreateClassRoom } from '../dtos/createClassroom.dto';
import { ReqUserTokenPayload, ServiceResponseDto } from 'src/common/dto';
import { USERROLE_TYPE } from 'src/common/enums';

@Injectable()
export class ClassRoomService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
  ) {}

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
}
