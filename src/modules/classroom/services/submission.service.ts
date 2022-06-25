import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { ClassRoom } from '../entities/classroom.entity';
import { Submission } from '../entities/submission.entity';
import { ServiceResponseDto } from 'src/common/dto';
import { EnrolledStudent } from '../entities/enrolled_students.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(EnrolledStudent)
    private enrolledStudentRepository: Repository<EnrolledStudent>,
  ) {}

  async createPendingSubmissions(
    entityManager: EntityManager,
    classRoomId: number,
    postId: number,
  ): Promise<Submission[]> {
    let enrolledStudents = await this.enrolledStudentRepository.find({
      where: { classRoomId },
    });

    if (enrolledStudents.length === 0) return [];

    let submissionsCreated = [];

    for (let i = 0; i < enrolledStudents.length; i++) {
      submissionsCreated.push(
        await this.submissionRepository.create({
          postId,
          assignedId: enrolledStudents[i].studentId,
        }),
      );
    }

    let submissionsSaved: Submission[] = await entityManager.save(
      submissionsCreated,
    );

    return submissionsSaved;
  }
}
