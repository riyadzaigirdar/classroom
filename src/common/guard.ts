import * as jwt from 'jsonwebtoken';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './decorator';

// =================== USED FOR AUTHENTICATED REQUEST ==================== //
@Injectable()
export class JwtAuth implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token: string = req.headers['authorization'];

    if (!token) throw new UnauthorizedException('Unauthorized');

    try {
      var decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new BadRequestException('Token invalid');
    }
    req['user'] = decoded;
    return true;
  }
}

// ========== FOR GRANTING PERMISSION TO USER WITH SPECIFIC ROLE ============ //
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<any>();
    const permission: { module: string; roles: string[] } =
      this.reflector.getAllAndOverride(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    if (!permission) return false;
    return permission.roles.some((role) => request.user?.role === role);
  }
}
