import { Reflector } from '@nestjs/core';
import { REQUEST_META_KEY } from './constants';
import { UserService } from '../modules/user/services/user.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<any>();
    const permission: {
      module: string;
      roles: string[];
      allowAnonymous?: boolean;
    } = this.reflector.getAllAndOverride(REQUEST_META_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!permission) {
      return false;
    }

    // First check if anonymous (public access) is allowed.
    if (permission.allowAnonymous !== undefined && permission.allowAnonymous) {
      return true;
    }
    if (!req.headers.authorization)
      throw new UnauthorizedException('Not a authorized user');

    // Validate user
    req.user = await this.userService.validateToken(req);

    // Check role permission
    return permission.roles.some((role) => req.user?.role === role);
  }
}
