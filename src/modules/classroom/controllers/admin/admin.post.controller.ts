import { AuthorizeGuard } from 'src/common/guard';
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
import { PostService } from '../../services/post.service';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { CreatePostDto } from '../../dtos/create-post.dto';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { ReqUser } from 'src/common/decorator/param.decortor';
import { QuerySubmissionDto } from '../../dtos/query-submission.dto';
import { SubmissionService } from '../../services/submission.service';
import { UpdatePostDto } from '../../dtos/update-post.dto';

@UseGuards(AuthorizeGuard)
@Permissions('post', ['admin'])
@Controller('admin/post')
export class AdminPostController {
  constructor(
    private readonly postService: PostService,
    private readonly submissionService: SubmissionService,
  ) {}

  @Post('')
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
