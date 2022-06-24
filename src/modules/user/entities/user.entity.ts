import { USERROLE_TYPE } from 'src/common/enums';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { AbstractRepository } from '../../../common/abstract-repository';
import { ulid } from 'ulid';
import { Submission } from 'src/modules/classroom/entities/submission.entity';
import { Post } from 'src/modules/classroom/entities/post.entity';
import { ClassRoom } from 'src/modules/classroom/entities/classroom.entity';
import { EnrolledStudent } from 'src/modules/classroom/entities/enrolled-students.entity';
import { StudentMeta } from './student-meta';

@Entity('user')
export class User extends AbstractRepository {
  @Column({ type: 'varchar', nullable: true })
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', default: ulid(), nullable: true })
  emailVerifyCode: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  lastLogin: string;

  @Column({
    type: 'enum',
    enum: USERROLE_TYPE,
    default: 'student',
    nullable: false,
  })
  role: string;

  // ======================= VIRTUAL COLUMN ===================== //
  @OneToMany((type) => Submission, (submission) => submission.assigned)
  submissions: Submission[];

  @OneToMany((type) => Post, (post) => post.createdBy)
  posts: Post[];

  @OneToMany((type) => ClassRoom, (classRoom) => classRoom.createdBy)
  classroomsCreated: ClassRoom[];

  @OneToMany((type) => ClassRoom, (classRoom) => classRoom.teacher)
  classrooms: ClassRoom[];

  @OneToMany(
    (type) => EnrolledStudent,
    (enrolledStudent) => enrolledStudent.student,
  )
  enrolledClasses: ClassRoom[];

  @OneToOne((type) => StudentMeta, (studentMeta) => studentMeta.user)
  studentMeta: StudentMeta;
}
