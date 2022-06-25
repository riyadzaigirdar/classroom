import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, getManager, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { ClassRoom } from '../entities/classroom.entity';
import { Submission } from '../entities/submission.entity';
import { CreatePostDto } from '../dtos/create-post.dto';
import { ReqUserTokenPayloadDto, ServiceResponseDto } from 'src/common/dto';
import { USERROLE_TYPE } from 'src/common/enums';
import { SubmissionService } from './submission.service';
import { UpdatePostDto } from '../dtos/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
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
      throw new BadRequestException(
        'Teacher not permitted to create post under this class room',
      );

    if (!foundClassroom)
      throw new BadRequestException('Classroom with that id not found');

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
    body: UpdatePostDto,
  ): Promise<ServiceResponseDto> {
    let post: Post = await this.postRepository.findOne({ where: { id } });

    if (!post) throw new BadRequestException('Post with that id not found');

    Object.keys(body).map((item) => (post[item] = body[item]));

    return {
      message: 'Successfully updated post',
      data: await this.postRepository.save(post),
    };
  }
}
