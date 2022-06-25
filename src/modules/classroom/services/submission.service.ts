import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { ClassRoom } from '../entities/classroom.entity';
import { Submission } from '../entities/submission.entity';
import { ReqUserTokenPayloadDto, ServiceResponseDto } from 'src/common/dto';
import { EnrolledStudent } from '../entities/enrolled_students.entity';
import { USERROLE_TYPE } from 'src/common/enums';
import { QuerySubmissionDto } from '../dtos/query-submission.dto';
import { count } from 'console';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(EnrolledStudent)
    private enrolledStudentRepository: Repository<EnrolledStudent>,
  ) {}

  async createPendingSubmissions(
    entityManager: EntityManager,
    classRoomId: number,
    postId: number,
  ): Promise<Submission[]> {
    let enrolledStudents = await this.enrolledStudentRepository.find({
      where: { classRoomId },
    });

    if (enrolledStudents.length === 0) return [];

    let submissionsCreated = [];

    for (let i = 0; i < enrolledStudents.length; i++) {
      submissionsCreated.push(
        await this.submissionRepository.create({
          postId,
          assignedId: enrolledStudents[i].studentId,
        }),
      );
    }

    let submissionsSaved: Submission[] = await entityManager.save(
      submissionsCreated,
    );

    return submissionsSaved;
  }

  async listSubmimissionOfAPost(
    reqUser: ReqUserTokenPayloadDto,
    postId: number,
    query: QuerySubmissionDto,
  ): Promise<ServiceResponseDto> {
    let post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) throw new BadRequestException('Post with that id not found');

    if (
      reqUser.role === USERROLE_TYPE.TEACHER &&
      (
        await this.classRoomRepository.findOne({
          where: { id: post.classRoomId },
        })
      ).teacherId !== reqUser.id
    ) {
      throw new BadRequestException(
        'Teacher not permitted to access this information',
      );
    }

    let baseQuery = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.assigned', 'assigned')
      .leftJoinAndSelect('submission.post', 'post')
      .where('post.id = :postId', { postId });

    if (Object.keys(query).length === 0) {
      baseQuery.andWhere('submission.status = :status', {
        status: query.status,
      });
    }

    let total = await baseQuery.getCount();

    let result = await baseQuery
      .select([
        'submission.postId as "postId"',
        'submission.id as "submissionId"',
        'submission.submittedFile as "submittedFile"',
        'submission.submittedAt as "submittedAt"',
        'submission.obtainedMarks as "submissionObtainedMarks"',
        'submission.status as "submissionStatus"',
        'assigned.id as "studentId"',
        'assigned.fullName as "studentFullName"',
        'post.id as "postId"',
      ])
      .limit(query.count)
      .offset((query.page - 1) * query.count)
      .orderBy('submission.createdAt', 'DESC')
      .getRawMany();

    return {
      data: {
        total,
        result,
      },
      message: 'Successsfully listed submission of a post',
    };
  }
}
