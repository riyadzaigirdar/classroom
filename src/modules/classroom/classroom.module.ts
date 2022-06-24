import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { ClassRoom } from './entities/classroom.entity';
import { Submission } from './entities/submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassRoom, Post, Submission])],
})
export class ClassroomModule {}
