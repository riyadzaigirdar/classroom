import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { ClassRoom } from '../entities/classroom.entity';
import { Submission } from '../entities/submission.entity';
import { CreateClassRoom } from '../dtos/createClassroom.dto';

@Injectable()
export class ClassRoomService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
  ) {}

  async createClassRoom(body: CreateClassRoom) {}

  // ================== GENERATE INVITE CODE(UUID) ========================== //
  private generateRandomInviteCode = () => uuidv4();
}
