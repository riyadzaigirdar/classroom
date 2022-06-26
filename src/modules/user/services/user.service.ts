import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisCacheService } from './redis.service';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { ReqUserTokenPayloadDto, ServiceResponseDto } from 'src/common/dto';
import { LoginRequestBodyDto, LoginServiceData } from '../dtos/login.dto';
import { USERROLE_TYPE } from 'src/common/enums';
import { EmailService } from 'src/modules/email/services/email.service';
import { EnrolledStudent } from 'src/modules/classroom/entities/enrolled-students.entity';
import { EnrollStudentDto } from 'src/modules/classroom/dtos/enroll-student.dto';
import { StudentMeta } from '../entities/student_meta';
import { ListUserQueryDto } from '../dtos/list-user-query.dto';
import { ChangePassword } from '../dtos/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(StudentMeta)
    private studentMetaRepository: Repository<StudentMeta>,
    private readonly emailService: EmailService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async createTeacher(body: CreateTeacherDto): Promise<ServiceResponseDto> {
    if (await this.userRepository.findOne({ where: { email: body.email } }))
      throw new BadRequestException('User with that email already exists');

    let password: string = this.generateRandomPassword();
    let hashedPassword: string = await this.hashPassword(password);

    let teacherSaved: User = await this.userRepository.save(
      await this.userRepository.create({
        ...body,
        role: USERROLE_TYPE.TEACHER,
        password: hashedPassword,
      }),
    );

    // ======================= SEND PASSWORD TO EMAIL ============================ //
    this.emailService.sendPasswordToEmail(teacherSaved.email, password);
    // ======================= SEND VERIFY CODE TO EMAIL ========================= //
    this.emailService.sendEmailVerifyCode(
      teacherSaved.email,
      teacherSaved.emailVerifyCode,
    );

    return {
      data: {
        id: teacherSaved.id,
        fullName: teacherSaved.fullName,
        email: teacherSaved.email,
      },
      message: 'Successfully added teacher',
    };
  }

  async createOrGetStudent(
    entityManager: EntityManager,
    body: EnrollStudentDto,
  ): Promise<User> {
    let found = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (found && found.role !== USERROLE_TYPE.STUDENT) {
      throw new ForbiddenException('Only student account allowed to enroll');
    }

    if (found && !this.checkPasswordMatch(found.password, body.password)) {
      throw new BadRequestException("Password didn't match");
    }

    if (
      found &&
      (
        await this.studentMetaRepository.findOne({
          where: { userId: found.id },
        })
      ).studentId !== body.studentId
    ) {
      throw new BadRequestException("Student id didn't match");
    }

    if (found) {
      return found;
    }

    let studentSaved: User = await entityManager.save(
      await this.userRepository.create({
        ...body,
        role: USERROLE_TYPE.STUDENT,
        password: await this.hashPassword(body.password),
      }),
    );

    let studentMeta: StudentMeta = await entityManager.save(
      await this.studentMetaRepository.create({
        userId: studentSaved.id,
        studentId: body.studentId,
      }),
    );

    return studentSaved;
  }

  async login(body: LoginRequestBodyDto): Promise<ServiceResponseDto> {
    let found: User = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (!found) throw new NotFoundException('User with that email not found');

    if (!(await this.checkPasswordMatch(found.password, body.password)))
      throw new BadRequestException("Password didn't math");

    found.lastLogin = new Date().toISOString();
    await this.userRepository.save(found);

    return {
      data: {
        accessToken: await this.genetateToken(found, 60 * 60 * 24 * 7), // 7 days
        refreshToken: await this.genetateToken(found, 60 * 60 * 24 * 21), // 21 days
      } as LoginServiceData,
      message: 'Successfully logged in',
    };
  }

  async listUser(query: ListUserQueryDto): Promise<ServiceResponseDto> {
    let baseQuery = this.userRepository.createQueryBuilder('user');

    if (query.role) {
      baseQuery.where('user.role = :role', { role: query.role });
    }

    let total = await baseQuery.getCount();

    let foundList = await baseQuery
      .select([
        'user.id as "userId"',
        'user.role as "userRole"',
        'user.email as "userEmail"',
        'user.fullName as "userFullName"',
        'user.lastLogin as "userLastLogin"',
        'user.emailVerified as "userEmailVerified"',
        'user.emailVerifyCode as "userEmailVerifyCode"',
      ])
      .limit(query.count)
      .offset((query.page - 1) * query.count)
      .orderBy('user.createdAt', 'DESC')
      .getRawMany();

    return {
      data: {
        result: foundList,
        total,
      },
      message: 'Successfully generated list of user',
    };
  }

  async validateToken(req: any): Promise<ReqUserTokenPayloadDto> {
    let decodedUser;
    try {
      decodedUser = jwt.verify(
        req.headers.authorization,
        process.env.JWT_SECRET,
      );
    } catch (error) {
      throw new UnauthorizedException('Token invalid');
    }

    let found: User = await this.userRepository.findOne({
      where: { id: decodedUser.id },
    });

    if (!found) throw new NotFoundException('User not found');

    return {
      id: found.id,
      fullName: found.fullName,
      email: found.email,
      role: found.role,
    };
  }

  async verifyEmail(emailVerifyCode: string): Promise<ServiceResponseDto> {
    let found: User = await this.userRepository.findOne({
      where: { emailVerifyCode },
    });

    if (!found) throw new NotFoundException('Invalid email verify code');

    if (found.emailVerified)
      throw new BadRequestException('Your email is already verified');

    found.emailVerified = true;
    found.emailVerifyCode = null;

    let saved: User = await this.userRepository.save(found);

    return {
      data: {
        id: saved.id,
        fullName: saved.fullName,
        emailVerifyCode: saved.emailVerifyCode,
        emailVerified: saved.emailVerified,
      },
      message: 'Successfully verified email',
    };
  }

  async getUser(body: Partial<User>) {
    return await this.userRepository.findOne(body);
  }

  async changePassword(
    reqUser: ReqUserTokenPayloadDto,
    body: ChangePassword,
  ): Promise<ServiceResponseDto> {
    let foundUser = await this.userRepository.findOne({
      where: { id: reqUser.id },
    });

    if (!foundUser) throw new NotFoundException('User not found');

    if (body.newPassword !== body.retypeNewPassword)
      throw new BadRequestException("New Password didn't match");

    if (
      !(await this.checkPasswordMatch(foundUser.password, body.currentPassword))
    )
      throw new BadRequestException("Current password doesn't match");

    if (await this.checkPasswordMatch(foundUser.password, body.newPassword))
      throw new BadRequestException('Must change password to a new one');

    foundUser.password = await this.hashPassword(body.newPassword);

    let savedUser = await this.userRepository.save(foundUser);

    return {
      data: {
        id: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
      },
      message: 'Successfully changed password',
    };
  }

  private async hashPassword(password): Promise<string> {
    const hash: string = await bcrypt.hash(password, 10);
    return hash;
  }

  private async checkPasswordMatch(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private async genetateToken(user: User, time: number): Promise<string> {
    let token: string = await jwt.sign(
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      } as ReqUserTokenPayloadDto,
      process.env.JWT_SECRET,
      {
        expiresIn: time,
        algorithm: 'HS256',
      },
    );
    await this.redisCacheService.set(token, user.id, time);
    return token;
  }

  // ================== GENERATE RANDOM PASSWORD(6 CHARACTER) ================ //
  private generateRandomPassword = (): string =>
    Math.floor(
      Math.random() * (Math.floor(999999) - Math.ceil(100000) + 1) +
        Math.ceil(100000),
    ).toString();
}
