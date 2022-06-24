import { SetMetadata } from '@nestjs/common';
import { REQUEST_META_KEY } from '../constants';

// =============== PERMISSION DECORATOR FOR GRANTING USER ROLES ===================== //
export const Permissions = (module: string, roles: string[]) =>
  SetMetadata(REQUEST_META_KEY, { module, roles });

export const AllowAnonymous = (module: string) =>
  SetMetadata(REQUEST_META_KEY, { module, allowAnonymous: true });
