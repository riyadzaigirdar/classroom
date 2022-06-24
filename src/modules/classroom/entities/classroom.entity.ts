import { ulid } from 'ulid';
import { CLASSROOM_STATUS_TYPE } from 'src/common/enums';
import { Column, Entity, OneToMany } from 'typeorm';

import { AbstractRepository } from '../../../common/abstract-repository';
import { Post } from './post.entity';

@Entity('class_room')
export class ClassRoom extends AbstractRepository {
  @Column({ type: 'varchar', nullable: false })
  className: string;

  @Column({ type: 'varchar', nullable: false })
  subjectName: string;

  @Column({ type: 'varchar', nullable: false, default: ulid() })
  inviteCode: string;

  @Column({
    type: 'enum',
    enum: CLASSROOM_STATUS_TYPE,
    default: CLASSROOM_STATUS_TYPE.ONGOING,
  })
  status: CLASSROOM_STATUS_TYPE;

  // =================== VIRTUAL COLUMNS ====================== //
  @OneToMany((type) => Post, (otp) => otp.classRoom)
  posts: Post[];
}
