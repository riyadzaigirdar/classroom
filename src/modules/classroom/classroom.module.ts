import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { ClassRoom } from './entities/classroom.entity';
import { Submission } from './entities/submission.entity';
import { ClassRoomService } from './services/classroom.service';
import { PostService } from './services/post.service';
import { SubmissionService } from './services/submission.service';
import { ClassRoomController } from './controllers/classroom.controller';
import { PostController } from './controllers/post.controller';
import { SubmissionController } from './controllers/submission.controller';
import { UserModule } from '../user/user.module';
import { AdminClassRoomController } from './controllers/admin.classroom.controller';
import { EnrolledStudent } from './entities/enrolled-students.entity';
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([ClassRoom, Post, Submission, EnrolledStudent]),
  ],
  controllers: [
    AdminClassRoomController,
    ClassRoomController,
    PostController,
    SubmissionController,
  ],
  providers: [ClassRoomService, PostService, SubmissionService],
})
export class ClassroomModule {}
