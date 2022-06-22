import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginRequestBodyDto, LoginServiceData } from '../dtos/login.dto';
import { User } from '../entities/user.entity';
import { ReqUserTokenPayload, ServiceResponseDto } from 'src/common/dto';
import { RedisCacheService } from './redis.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async hashPassword(password): Promise<String> {
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
      } as ReqUserTokenPayload,
      process.env.JWT_SECRET,
      {
        expiresIn: time,
        algorithm: 'HS256',
      },
    );
    await this.redisCacheService.set(token, user.id, time);
    return token;
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

  async validateToken(req: any): Promise<ReqUserTokenPayload> {
    let tokenInRedis = await this.redisCacheService.get(
      req.headers.authorization,
    );

    if (!tokenInRedis) throw new BadRequestException('Session expired');

    let found: User = await this.userRepository.findOne({
      where: { id: req.user.id },
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

    if (!found) throw new BadRequestException('Invalid code');

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
}
