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
import { AdminClassRoomController } from './controllers/admin/admin.classroom.controller';
import { EnrolledStudent } from './entities/enrolled-students.entity';
import { PublicClassRoomController } from './controllers/public/public.classroom.controller';
import { AdminPostController } from './controllers/admin/admin.post.controller';
import { AdminSubmissionController } from './controllers/admin/admin.submission.controller';
import { ResultController } from './controllers/result.controller';
import { EnrolledStudentService } from './services/result.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([ClassRoom, Post, Submission, EnrolledStudent]),
    UserModule,
  ],
  controllers: [
    AdminSubmissionController,
    PublicClassRoomController,
    ResultController,
    AdminClassRoomController,
    AdminPostController,
    ClassRoomController,
    PostController,
    SubmissionController,
  ],
  providers: [
    ClassRoomService,
    PostService,
    SubmissionService,
    EnrolledStudentService,
  ],
  exports: [TypeOrmModule.forFeature([Submission])],
})
export class ClassroomModule {}
