import { USERROLE_TYPE } from 'src/common/enums';
import { Column, Entity } from 'typeorm';
import { AbstractRepository } from '../../../common/abstract-repository';
import { ulid } from 'ulid';

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

  @Column({ type: 'varchar', default: null, nullable: true })
  lastLogin: string;

  @Column({
    type: 'enum',
    enum: USERROLE_TYPE,
    default: 'student',
    nullable: false,
  })
  role: string;
}
