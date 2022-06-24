import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ReqUserTokenPayload } from '../dto';

// ======================== PARAM DECORATOR ==================== //
// =============== FOR EXTRACTING KEY => USER FROM REQUEST HEADER ================== //
export const ReqUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as ReqUserTokenPayload;
  },
);
