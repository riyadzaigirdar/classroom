import { POST_TYPE } from 'src/common/enums';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractRepository } from '../../../common/abstract-repository';
import { ClassRoom } from './classroom.entity';
import { Submission } from './submission.entity';

@Entity('post')
export class Post extends AbstractRepository {
  @Column({ type: 'int', nullable: false })
  classRoomId: number;

  @Column({ type: 'float', nullable: false })
  totalMarks: number;

  @Column({ type: 'timestamp', nullable: false })
  deadLine: Date;

  @Column({ type: 'enum', nullable: false, enum: POST_TYPE })
  type: POST_TYPE;

  @Column({ type: 'boolean', default: false })
  resultPublished: boolean;

  // ====================== VIRTUAL COLUMNS =================== //
  @ManyToOne((type) => ClassRoom, (classRoom) => classRoom.posts, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'classRoomId' })
  classRoom: ClassRoom[];

  @OneToMany((type) => Submission, (submission) => submission.post)
  submissions: Submission[];
}
