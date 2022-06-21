import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { ReqUserTokenPayload } from './dto';
export const PERMISSION_KEY = 'roles';

// =============== PERMISSION DECORATOR FOR GRANTING USER ROLES ===================== //
export const Permissions = (module: string, roles: string[]) =>
  SetMetadata(PERMISSION_KEY, { module, roles });

// ========== FOR EXTRACTING KEY => USER FROM REQUEST HEADER ================== //
export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as ReqUserTokenPayload;
  },
);