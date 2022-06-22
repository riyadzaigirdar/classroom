import { USERROLE_TYPE } from 'src/common/enums';
import { Column, Entity } from 'typeorm';
import { AbstractRepository } from '../../../common/abstract-repository';

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

  @Column({
    type: 'enum',
    enum: USERROLE_TYPE,
    default: 'student',
    nullable: false,
  })
  role: string;
}
