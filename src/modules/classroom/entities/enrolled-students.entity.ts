import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractRepository } from '../../../common/abstract-repository';
import { ClassRoom } from './classroom.entity';

@Entity('enrolled_students')
export class EnrolledStudent extends AbstractRepository {
  @Column({ type: 'int', nullable: false })
  classRoomId: number;

  @Column({ type: 'int', nullable: false })
  studentId: number;

  @Column({ type: 'float', nullable: true, default: null })
  curatedResult: number;

  // ===================== VIRTUAL COLUMN ======================= //
  @ManyToOne((type) => ClassRoom, (classroom) => classroom.enrolled_students, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'classRoomId' })
  classRoom: ClassRoom[];

  @ManyToOne((type) => User, (user) => user.enrolledClasses, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'studentId' })
  student: User[];
}
