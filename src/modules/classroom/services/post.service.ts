import { v4 as uuidv4 } from 'uuid';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, getManager, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { ClassRoom } from '../entities/classroom.entity';
import { Submission } from '../entities/submission.entity';
import { CreatePostDto } from '../dtos/create-post.dto';
import { ReqUserTokenPayloadDto, ServiceResponseDto } from 'src/common/dto';
import { SUBMISSION_STATUS_TYPE, USERROLE_TYPE } from 'src/common/enums';
import { SubmissionService } from './submission.service';
import { UpdatePostDto } from '../dtos/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    private readonly submissionService: SubmissionService,
  ) {}

  async createPost(
    reqUser: ReqUserTokenPayloadDto,
    body: CreatePostDto,
  ): Promise<ServiceResponseDto> {
    let foundClassroom = await this.classRoomRepository.findOne({
      where: { id: body.classRoomId },
    });

    // ========= Techer must be the teacher of that classroom =========== //

    if (
      reqUser.role === USERROLE_TYPE.TEACHER &&
      foundClassroom.teacherId !== reqUser.id
    )
      throw new ForbiddenException(
        'Teacher not permitted to create post under this class room',
      );

    if (!foundClassroom)
      throw new ForbiddenException('Classroom with that id not found');

    let post: Post;
    try {
      await getManager().transaction(async (entityManager: EntityManager) => {
        let postCreated = await this.postRepository.create({
          ...body,
          createdById: reqUser.id,
        });

        post = await entityManager.save(postCreated);

        await this.submissionService.createPendingSubmissions(
          entityManager,
          foundClassroom.id,
          post.id,
        );
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Bad Request');
    }

    return {
      data: post,
      message: 'Successfully created post',
    };
  }

  async updatePost(
    reqUser: ReqUserTokenPayloadDto,
    id: number,
    body: Partial<UpdatePostDto>,
  ): Promise<ServiceResponseDto> {
    let post: Post = await this.postRepository.findOne({ where: { id } });

    if (
      reqUser.role !== USERROLE_TYPE.ADMIN &&
      !(await this.classRoomRepository.findOne({
        where: { id: post.classRoomId, teacherId: reqUser.id },
      }))
    )
      throw new ForbiddenException(
        'Teacher not permitted to update this information',
      );

    if (!post) throw new NotFoundException('Post with that id not found');

    if (body.resultPublished && post.resultPublished)
      throw new ForbiddenException('Post result already published');

    if (
      body.resultPublished &&
      (await this.submissionRepository.findOne({
        postId: post.id,
        status: SUBMISSION_STATUS_TYPE.SUBMITTED,
      }))
    )
      throw new ForbiddenException(
        'Post has some submission need to be examined',
      );

    let savedSubmissions: Submission[];
    let postSaved: Post;

    if (body.resultPublished) {
      savedSubmissions = (
        await this.submissionRepository.find({
          where: [
            { status: SUBMISSION_STATUS_TYPE.EXPIRED },
            { status: SUBMISSION_STATUS_TYPE.PENDING },
            { obtainedMarks: null },
          ],
        })
      ).map((item) => ({ ...item, obtainedMarks: 0 }));
    }

    Object.keys(body).map((item) => (post[item] = body[item]));

    try {
      await getManager().transaction(async (entiyManager: EntityManager) => {
        postSaved = await entiyManager.save(post);
        savedSubmissions.length !== 0 &&
          (await entiyManager.save(savedSubmissions));
      });
    } catch (error) {
      throw new BadRequestException('Something went wrong try again later');
    }

    return {
      message: 'Successfully updated post',
      data: postSaved,
    };
  }
}
