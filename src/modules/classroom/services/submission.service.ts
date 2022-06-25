import { v4 as uuidv4 } from 'uuid';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { ClassRoom } from '../entities/classroom.entity';
import { Submission } from '../entities/submission.entity';
import { ReqUserTokenPayloadDto, ServiceResponseDto } from 'src/common/dto';
import { EnrolledStudent } from '../entities/enrolled-students.entity';
import { SUBMISSION_STATUS_TYPE, USERROLE_TYPE } from 'src/common/enums';
import { QuerySubmissionDto } from '../dtos/query-submission.dto';
import { count } from 'console';
import { QueryListSubmissionDto } from '../dtos/query-list-submission.dto';
import { MEDIA_HOST } from 'src/common/constants';
import { UpdateSubmissionDto } from '../dtos/update-submission.dto';
import { CreateSubmissionDto } from '../dtos/create-submission.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';

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
    private readonly userService: UserService,
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

  // ================ ADMIN & TEACHER ================ //
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
      throw new ForbiddenException(
        'Teacher not permitted to access this information',
      );
    }

    let baseQuery = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.assigned', 'assigned')
      .leftJoinAndSelect('submission.post', 'post')
      .andWhere('post.id = :postId', { postId });

    let queryArray: string[] = [
      'submission.postId as "postId"',
      'submission.id as "submissionId"',
      'submission.submittedFile as "submittedFile"',
      'submission.submittedAt as "submittedAt"',
      'submission.status as "submissionStatus"',
      'assigned.id as "studentId"',
      'assigned.fullName as "studentFullName"',
      'post.type as "postType"',
      'post.resultPublished as "resultPublished"',
      'post.id as "postId"',
    ];

    if (query.status) {
      baseQuery.andWhere('submission.status = :status', {
        status: query.status,
      });
    }

    if (query.resultPublished) {
      console.log('yes');
      baseQuery.andWhere('post.resultPublished = :resultPublished', {
        resultPublished: query.resultPublished,
      });
      queryArray.push('submission.obtainedMarks as "submissionObtainerMarks"');
    }

    let total: number = await baseQuery.getCount();

    let result = await baseQuery
      .select(queryArray)
      .limit(query.count)
      .offset((query.page - 1) * query.count)
      .orderBy('submission.createdAt', 'DESC')
      .getRawMany();

    return {
      data: {
        total,
        result: result.map((item) => ({
          ...item,
          submittedFile: MEDIA_HOST + '/' + item.submittedFile,
        })),
      },
      message: 'Successsfully listed submission of a post',
    };
  }

  // ================ ADMIN & TEACHER & STUDENT ================ //
  async listSubmissions(
    reqUser: ReqUserTokenPayloadDto,
    query: QueryListSubmissionDto,
  ): Promise<ServiceResponseDto> {
    let baseQuery = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.assigned', 'assigned')
      .leftJoinAndSelect('submission.post', 'post')
      .leftJoinAndSelect('post.classRoom', 'classroom');

    let queryArray: string[] = [
      'submission.id as "submissionId"',
      'submission.postId as "postId"',
      'submission.submittedFile as "submittedFile"',
      'submission.submittedAt as "submittedAt"',
      'submission.status as "submissionStatus"',
      'assigned.id as "studentId"',
      'assigned.fullName as "studentFullName"',
      'post.type as "postType"',
      'post.resultPublished as "resultPublished"',
      'post.id as "postId"',
      'submission.createdAt as "assignedAt"',
    ];

    if (reqUser.role === USERROLE_TYPE.TEACHER) {
      baseQuery.andWhere('classroom.teacherId = :teacherId', {
        teacherId: reqUser.id,
      });
    }

    if (reqUser.role === USERROLE_TYPE.STUDENT) {
      baseQuery.andWhere('submission.assignedId = :assignedId', {
        assignedId: reqUser.id,
      });
    }

    if (query.postId) {
      baseQuery.andWhere('post.id = :postId', { postId: query.postId });
    }

    if (query.status) {
      baseQuery.andWhere('submission.status = :status', {
        status: query.status,
      });
    }

    if (query.resultPublished) {
      baseQuery.andWhere('post.resultPublished = :resultPublished', {
        resultPublished: query.resultPublished,
      });
      queryArray.push('submission.obtainedMarks as "submissionObtainerMarks"');
    }

    let total: number = await baseQuery.getCount();

    let result = await baseQuery
      .select(queryArray)
      .limit(query.count)
      .offset((query.page - 1) * query.count)
      .orderBy('submission.createdAt', 'DESC')
      .getRawMany();

    return {
      data: {
        result: result.map((item) => ({
          ...item,
          submittedFile: MEDIA_HOST + '/' + item.submittedFile,
        })),
        total,
      },
      message: 'Successfully listed submission',
    };
  }

  async createSubmission(
    reqUser: ReqUserTokenPayloadDto,
    body: CreateSubmissionDto,
  ): Promise<ServiceResponseDto> {
    let post: Post = await this.postRepository.findOne({
      where: { id: body.postId },
    });

    if (!post) throw new NotFoundException("Post with that id doesn't exist");

    let student: User = await this.userService.getUser({ id: body.assignedId });

    if (!student) throw new NotFoundException('Assignee not found');

    if (student.role !== USERROLE_TYPE.STUDENT)
      throw new BadRequestException('Assignee is not a student');

    let submissionFound: Submission = await this.submissionRepository.findOne({
      where: { postId: body.postId, assignedId: body.assignedId },
    });

    if (submissionFound)
      throw new ForbiddenException(
        `Assignee already has a submission ${submissionFound.status} in post`,
      );

    let newSubmission: Submission = await this.submissionRepository.save(
      await this.submissionRepository.create(body),
    );

    return {
      data: newSubmission,
      message: 'Successfully created submission',
    };
  }

  async submitFileSubmission(
    reqUser: ReqUserTokenPayloadDto,
    submissionId: number,
    file: Express.Multer.File,
  ): Promise<ServiceResponseDto> {
    if (!file) throw new BadRequestException('No file given');

    let foundSubmission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!foundSubmission)
      throw new NotFoundException('Submission with that id not found');

    if (
      (foundSubmission.status === SUBMISSION_STATUS_TYPE.EXAMINED ||
        foundSubmission.status === SUBMISSION_STATUS_TYPE.EXPIRED) &&
      reqUser.role !== USERROLE_TYPE.ADMIN
    )
      throw new ForbiddenException('Submission is already examined or expired');

    foundSubmission.submittedFile = file.path;
    foundSubmission.submittedAt = new Date();
    foundSubmission.status = SUBMISSION_STATUS_TYPE.SUBMITTED;

    let savedSubmission = await this.submissionRepository.save(foundSubmission);

    return {
      data: savedSubmission,
      message: 'Successfully added image',
    };
  }

  async updateSubmission(
    reqUser: ReqUserTokenPayloadDto,
    submissionId: number,
    body: UpdateSubmissionDto,
  ): Promise<ServiceResponseDto> {
    let foundSubmission: Submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!foundSubmission)
      throw new NotFoundException('Submission with that id not found');

    let post = await this.postRepository.findOne({
      where: { id: foundSubmission.postId },
    });

    if (
      reqUser.role !== USERROLE_TYPE.ADMIN &&
      (
        await this.classRoomRepository.findOne({
          where: {
            teacherId: reqUser.id,
            id: post.classRoomId,
          },
        })
      ).id
    )
      throw new ForbiddenException('Teacher not permitted to update this info');

    if (post.totalMarks < body.obtainedMarks) {
      throw new ForbiddenException(
        "Obtained marks can't be greater than total marks",
      );
    }

    Object.keys(body).map((item) => (foundSubmission[item] = body[item]));

    let data = await this.submissionRepository.save(foundSubmission);

    return {
      data,
      message: 'Successfully updated submission',
    };
  }
}
