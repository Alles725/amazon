import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ChangePasswordResponse, ErrorCode, UserProfile } from '@amazon-mvp/api-contract';
import { ApiError } from '../../common/api-error';
import { StructuredLogger } from '../../common/structured-logger';
import {
  USERS_API,
  UserRecord,
  UserWithSecret,
  UsersApi,
  normalizeEmail,
} from '../users/users.api';
import { isUniqueViolation, toProfile } from './auth.service';
import { PasswordService } from './password.service';
import { SESSIONS_API, SessionsApi } from './sessions.api';

export interface CurrentSession {
  userId: string;
  sessionId: string;
}

/**
 * "Acesso e segurança": edits to the signed-in account. Credential changes
 * (password, e-mail) require the current password and end every OTHER session of
 * the account; the session that made the change stays signed in. Passwords are
 * never logged — only user ids and outcomes.
 */
@Injectable()
export class AccountService {
  constructor(
    @Inject(USERS_API) private readonly users: UsersApi,
    private readonly passwords: PasswordService,
    @Inject(SESSIONS_API) private readonly sessions: SessionsApi,
    private readonly logger: StructuredLogger,
  ) {}

  async updateProfile(userId: string, displayName: string): Promise<UserProfile> {
    if (!(await this.users.findById(userId))) throw ApiError.sessionRequired();
    const user = await this.users.updateDisplayName(userId, displayName);
    this.logger.log(`display name changed: ${userId}`, 'AccountService');
    return toProfile(user);
  }

  async changePassword(
    session: CurrentSession,
    currentPassword: string,
    newPassword: string,
  ): Promise<ChangePasswordResponse> {
    await this.confirmPassword(session.userId, currentPassword);
    if (newPassword === currentPassword) {
      const message = 'newPassword must be different from the current password';
      throw new ApiError(ErrorCode.VALIDATION_FAILED, message, HttpStatus.BAD_REQUEST, [
        { field: 'newPassword', message },
      ]);
    }
    await this.users.updatePasswordHash(session.userId, await this.passwords.hash(newPassword));
    const revokedSessions = await this.sessions.revokeOthersForUser(
      session.userId,
      session.sessionId,
    );
    this.logger.log(
      `password changed: ${session.userId}; ${revokedSessions} other session(s) revoked`,
      'AccountService',
    );
    return { success: true, revokedSessions };
  }

  async changeEmail(
    session: CurrentSession,
    email: string,
    currentPassword: string,
  ): Promise<UserProfile> {
    const user = await this.confirmPassword(session.userId, currentPassword);
    if (normalizeEmail(email) === user.email) return toProfile(user);
    // Same friendly-duplicate + unique-index guard as registration.
    if (await this.users.existsByEmail(email)) throw ApiError.emailAlreadyRegistered();
    let updated: UserRecord;
    try {
      updated = await this.users.updateEmail(session.userId, email);
    } catch (error) {
      if (isUniqueViolation(error)) throw ApiError.emailAlreadyRegistered();
      throw error;
    }
    const revoked = await this.sessions.revokeOthersForUser(session.userId, session.sessionId);
    this.logger.log(
      `email changed: ${session.userId}; ${revoked} other session(s) revoked`,
      'AccountService',
    );
    return toProfile(updated);
  }

  private async confirmPassword(userId: string, password: string): Promise<UserWithSecret> {
    const user = await this.users.findByIdWithSecret(userId);
    if (!user) throw ApiError.sessionRequired();
    if (!(await this.passwords.verify(user.passwordHash, password))) {
      this.logger.warn(`failed password confirmation for user ${userId}`, 'AccountService');
      throw ApiError.currentPasswordInvalid();
    }
    return user;
  }
}
