import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiConfig } from '@amazon-mvp/config-schema';
import { Request } from 'express';
import { ApiError } from '../../common/api-error';
import { RequestContextStore } from '../../common/request-context';
import { API_CONFIG } from '../../config/api-config';
import { SESSIONS_API, SessionsApi } from './sessions.api';

export const IS_PUBLIC = 'auth:isPublic';

/** Opt a route out of the guard. Everything else requires a valid session. */
export const Public = () => SetMetadata(IS_PUBLIC, true);

export interface AuthenticatedRequest extends Request {
  auth?: { userId: string; sessionId: string; expiresAt: Date };
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject(SESSIONS_API) private readonly sessions: SessionsApi,
    private readonly reflector: Reflector,
    @Inject(API_CONFIG) private readonly config: ApiConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[this.config.session.cookieName];

    const session = await this.sessions.validate(token);
    if (!session) throw ApiError.sessionRequired();

    request.auth = {
      userId: session.userId,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
    };
    // Makes every downstream log line attributable to a user.
    RequestContextStore.setUserId(session.userId);
    return true;
  }
}

export const CurrentAuth = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.auth;
});
