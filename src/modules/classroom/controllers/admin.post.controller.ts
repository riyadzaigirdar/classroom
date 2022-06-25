import { AuthorizeGuard } from 'src/common/guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { Permissions } from 'src/common/decorator/controller.decorator';
import { CreatePostDto } from '../dtos/create-post.dto';
import {
  ReqUserTokenPayloadDto,
  ResponseDto,
  ServiceResponseDto,
} from 'src/common/dto';
import { ReqUser } from 'src/common/decorator/param.decortor';

@UseGuards(AuthorizeGuard)
@Permissions('classroom', ['admin'])
@Controller('admin/classroom')
export class AdminPostController {
  constructor(private readonly postService: PostService) {}

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
}
