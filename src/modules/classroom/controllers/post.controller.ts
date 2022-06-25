import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { AuthorizeGuard } from 'src/common/guard';
import { CreatePostDto } from '../dtos/create-post.dto';
import { QuerySubmissionDto } from '../dtos/query-submission.dto';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { PostService } from '../services/post.service';
import { SubmissionService } from '../services/submission.service';

@UseGuards(AuthorizeGuard)
@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly submissionService: SubmissionService,
  ) {}

  @Post('')
  @Permissions('post', ['teacher'])
  async createPost(
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Body() body: CreatePostDto,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.postService.createPost(reqUser, body);
    return {
      code: 201,
      success: true,
      message,
      data,
    };
  }

  @HttpCode(200)
  @Put(':postId')
  @Permissions('post', ['teacher'])
  async updatePost(
    @Param('postId') postId: number,
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Body() body: UpdatePostDto,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.postService.updatePost(reqUser, postId, body);
    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }

  @Get(':postId/submissions')
  @Permissions('post-submission', ['teacher'])
  async listSubmimissionUnderPost(
    @Param('postId') postId: number,
    @ReqUser() reqUser: ReqUserTokenPayloadDto,
    @Query() query: QuerySubmissionDto,
  ): Promise<ResponseDto> {
    let { data, message }: ServiceResponseDto =
      await this.submissionService.listSubmimissionOfAPost(
        reqUser,
        postId,
        query,
      );
    return {
      code: 200,
      success: true,
      message,
      data,
    };
  }
}
