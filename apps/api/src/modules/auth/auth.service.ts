import { Inject, Injectable } from '@nestjs/common';
import { SessionResponse, UserProfile } from '@amazon-mvp/api-contract';
import { ApiError } from '../../common/api-error';
import { StructuredLogger } from '../../common/structured-logger';
import { USERS_API, UserRecord, UsersApi } from '../users/users.api';
import { PasswordService } from './password.service';
import { IssuedSession, SESSIONS_API, SessionsApi } from './sessions.api';

/**
 * A hash of a throwaway password, used to keep login timing roughly constant
 * whether or not the email exists. Computed once at module load.
 */
let decoyHash: string | null = null;

export interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthResult {
  session: IssuedSession;
  profile: UserProfile;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_API) private readonly users: UsersApi,
    private readonly passwords: PasswordService,
    @Inject(SESSIONS_API) private readonly sessions: SessionsApi,
    private readonly logger: StructuredLogger,
  ) {}

  async register(
    input: { email: string; password: string; displayName: string },
    meta: RequestMeta = {},
  ): Promise<AuthResult> {
    if (await this.users.existsByEmail(input.email)) {
      throw ApiError.emailAlreadyRegistered();
    }

    const passwordHash = await this.passwords.hash(input.password);

    let user: UserRecord;
    try {
      user = await this.users.create({
        email: input.email,
        passwordHash,
        displayName: input.displayName,
      });
    } catch (error) {
      // Lost the race against a concurrent registration; the unique index is the
      // real guard, the check above is only for a friendlier common path.
      if (isUniqueViolation(error)) throw ApiError.emailAlreadyRegistered();
      throw error;
    }

    this.logger.log(`user registered: ${user.id}`, 'AuthService');
    const session = await this.sessions.issue(user.id, meta);
    return { session, profile: toProfile(user) };
  }

  /**
   * Backs the "sign in or create an account" split screen: the client needs to
   * know, before asking for a password, whether to show the password step or
   * the "new to Amazon" step. Reveals existence only — nothing else about the
   * account — reusing the same existsByEmail check `register` already relies
   * on for its friendly duplicate-email error.
   */
  async identify(email: string): Promise<{ exists: boolean }> {
    return { exists: await this.users.existsByEmail(email) };
  }

  async login(input: { email: string; password: string }, meta: RequestMeta = {}): Promise<AuthResult> {
    const user = await this.users.findByEmailWithSecret(input.email);

    if (!user) {
      // Spend comparable time so a missing account is not detectable by latency.
      decoyHash ??= await this.passwords.hash('decoy-password-for-timing');
      await this.passwords.verify(decoyHash, input.password);
      throw ApiError.invalidCredentials();
    }

    if (!(await this.passwords.verify(user.passwordHash, input.password))) {
      this.logger.warn(`failed login for user ${user.id}`, 'AuthService');
      throw ApiError.invalidCredentials();
    }

    const session = await this.sessions.issue(user.id, meta);
    this.logger.log(`login succeeded: ${user.id}`, 'AuthService');
    return { session, profile: toProfile(user) };
  }

  async logout(token: string | undefined): Promise<void> {
    if (token) await this.sessions.revoke(token);
  }

  async currentSession(userId: string, expiresAt: Date): Promise<SessionResponse> {
    const user = await this.users.findById(userId);
    if (!user) throw ApiError.sessionRequired();
    return { user: toProfile(user), expiresAt: expiresAt.toISOString() };
  }
}

function toProfile(user: UserRecord): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';
}
