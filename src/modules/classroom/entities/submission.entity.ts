import { SUBMISSION_STATUS_TYPE } from 'src/common/enums';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractRepository } from '../../../common/abstract-repository';
import { Post } from './post.entity';

@Entity('submission')
export class Submission extends AbstractRepository {
  @Column({ type: 'int', nullable: false })
  postId: number;

  @Column({ type: 'int', nullable: false })
  assignedId: number;

  @Column({ type: 'varchar', nullable: true })
  submittedFile: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  submittedAt: Date;

  @Column({ type: 'float', nullable: true, default: null })
  obtainedMarks: number;

  @Column({
    type: 'enum',
    enum: SUBMISSION_STATUS_TYPE,
    default: SUBMISSION_STATUS_TYPE.PENDING,
  })
  status: SUBMISSION_STATUS_TYPE;

  // ====================== VIRTUAL COLUMN ===================== //

  @ManyToOne((type) => User, (user) => user.submissions, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'assignedId' })
  assigned: User;

  @ManyToOne((type) => Post, (post) => post.submissions, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'postId' })
  post: Post;
}
