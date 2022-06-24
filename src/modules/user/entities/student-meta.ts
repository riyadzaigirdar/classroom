import { Column, Entity, OneToOne } from 'typeorm';
import { AbstractRepository } from '../../../common/abstract-repository';
import { User } from './user.entity';

@Entity('student_meta')
export class StudentMeta extends AbstractRepository {
  @Column({ type: 'varchar', nullable: false })
  studentId: string;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @OneToOne((type) => User, (user) => user.studentMeta)
  user: User;
}
