import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LoginRequestBodyDto,
  LoginServiceData,
  LoginServiceResponse,
} from '../dtos/login.dto';
import { User } from '../entities/user.entity';
import { ReqUserTokenPayload } from 'src/common/dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async hashPassword(password): Promise<String> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  private async checkPasswordMatch(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private async genetateToken(user: User, time: number): Promise<string> {
    return await jwt.sign(
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
  }

  async login(body: LoginRequestBodyDto): Promise<LoginServiceResponse> {
    let found = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (!found) throw new BadRequestException('User with that email not found');

    if (!(await this.checkPasswordMatch(found.password, body.password)))
      throw new BadRequestException("Password didn't math");

    return {
      data: {
        accessToken: await this.genetateToken(found, 60 * 60 * 24 * 7), // 7 days
        refreshToken: await this.genetateToken(found, 60 * 60 * 24 * 21), // 21 days
      },
      message: 'Successfully logged in',
    };
  }

  async validateToken(req: any): Promise<ReqUserTokenPayload> {
    let found = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    if (!found) throw new BadRequestException('User not found');

    return {
      id: found.id,
      fullName: found.fullName,
      email: found.email,
      role: found.role,
    };
  }
}
