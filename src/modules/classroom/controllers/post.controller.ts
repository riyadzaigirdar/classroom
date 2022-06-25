import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { ReqUser } from 'src/common/decorator/param.decortor';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { AuthorizeGuard } from 'src/common/guard';
import { CreatePostDto } from '../dtos/create-post.dto';
import { PostService } from '../services/post.service';

@UseGuards(AuthorizeGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('')
  @Permissions('classroom', ['teacher'])
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
}
