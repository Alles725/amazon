import { ErrorCode } from '@amazon-mvp/api-contract';
import { ApiError } from '../../common/api-error';
import { StructuredLogger } from '../../common/structured-logger';
import { UsersApi, UserRecord, UserWithSecret } from '../users/users.api';
import { AccountService } from './account.service';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { SessionsApi } from './sessions.api';
import { generateSessionToken, hashSessionToken } from './session-token';

describe('session tokens', () => {
  it('generates a distinct high-entropy token each time', () => {
    const tokens = new Set(Array.from({ length: 200 }, generateSessionToken));
    expect(tokens.size).toBe(200);
    for (const token of tokens) expect(token.length).toBeGreaterThanOrEqual(43);
  });

  it('hashes deterministically and never returns the plaintext', () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    expect(hashSessionToken(token)).not.toBe(token);
    expect(hashSessionToken(token)).toHaveLength(64);
  });
});

describe('PasswordService', () => {
  const passwords = new PasswordService();

  it('produces an argon2id hash that verifies', async () => {
    const hash = await passwords.hash('correct horse battery staple');
    expect(hash.startsWith('$argon2id$')).toBe(true);
    await expect(passwords.verify(hash, 'correct horse battery staple')).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await passwords.hash('correct horse battery staple');
    await expect(passwords.verify(hash, 'wrong password entirely')).resolves.toBe(false);
  });

  it('salts: the same password hashes differently each time', async () => {
    const [a, b] = await Promise.all([passwords.hash('same password 123'), passwords.hash('same password 123')]);
    expect(a).not.toBe(b);
  });

  it('treats a malformed stored hash as a failed login, not a crash', async () => {
    await expect(passwords.verify('not-a-hash', 'anything')).resolves.toBe(false);
  });
});

class FakeUsers implements UsersApi {
  private readonly rows = new Map<string, UserWithSecret>();

  async create(input: { email: string; passwordHash: string; displayName: string }) {
    const record: UserWithSecret = {
      id: `user-${this.rows.size + 1}`,
      email: input.email,
      displayName: input.displayName,
      passwordHash: input.passwordHash,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    this.rows.set(record.email, record);
    return strip(record);
  }
  async findById(id: string) {
    const found = [...this.rows.values()].find((row) => row.id === id);
    return found ? strip(found) : null;
  }
  async findByEmailWithSecret(email: string) {
    return this.rows.get(email) ?? null;
  }
  async existsByEmail(email: string) {
    return this.rows.has(email);
  }
  async findByIdWithSecret(id: string) {
    return [...this.rows.values()].find((row) => row.id === id) ?? null;
  }
  async updateDisplayName(id: string, displayName: string) {
    const row = (await this.findByIdWithSecret(id))!;
    row.displayName = displayName;
    return strip(row);
  }
  async updatePasswordHash(id: string, passwordHash: string) {
    (await this.findByIdWithSecret(id))!.passwordHash = passwordHash;
  }
  async updateEmail(id: string, email: string) {
    const row = (await this.findByIdWithSecret(id))!;
    this.rows.delete(row.email);
    row.email = email;
    this.rows.set(email, row);
    return strip(row);
  }
}

const strip = (row: UserWithSecret): UserRecord => ({
  id: row.id,
  email: row.email,
  displayName: row.displayName,
  createdAt: row.createdAt,
});

class FakeSessions implements Partial<SessionsApi> {
  readonly issued: string[] = [];
  readonly revoked: string[] = [];

  async issue(userId: string) {
    this.issued.push(userId);
    return { token: `token-for-${userId}`, expiresAt: new Date(Date.now() + 3600_000) };
  }

  async revoke(token: string) {
    this.revoked.push(token);
  }

  readonly revokedOthers: Array<[string, string]> = [];
  async revokeOthersForUser(userId: string, keepSessionId: string) {
    this.revokedOthers.push([userId, keepSessionId]);
    return 2;
  }
}

describe('AuthService', () => {
  const build = () => {
    const users = new FakeUsers();
    const sessions = new FakeSessions();

    const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as unknown as StructuredLogger;
    return {
      users,
      sessions,
      service: new AuthService(
        users,
        new PasswordService(),
        sessions as unknown as SessionsApi,
        logger,
      ),
    };
  };

  const credentials = {
    email: 'ada@example.com',
    password: 'correct horse battery staple',
    displayName: 'Ada Lovelace',
  };

  it('registers a user, hashes the password and starts a session', async () => {
    const { service, sessions } = build();
    const result = await service.register(credentials);

    expect(result.profile.email).toBe('ada@example.com');
    expect(result.session.token).toBe('token-for-user-1');
    expect(sessions.issued).toEqual(['user-1']);
    expect(JSON.stringify(result)).not.toContain(credentials.password);
  });

  it('rejects a duplicate email', async () => {
    const { service } = build();
    await service.register(credentials);
    await expect(service.register(credentials)).rejects.toMatchObject({
      code: ErrorCode.AUTH_EMAIL_ALREADY_REGISTERED,
    });
  });

  it('logs in with valid credentials', async () => {
    const { service } = build();
    await service.register(credentials);
    const result = await service.login({ email: credentials.email, password: credentials.password });
    expect(result.profile.id).toBe('user-1');
  });

  it('returns the same generic error for a wrong password and an unknown email', async () => {
    const { service } = build();
    await service.register(credentials);

    const wrongPassword = await service
      .login({ email: credentials.email, password: 'definitely wrong pw' })
      .catch((error: ApiError) => error);
    const unknownEmail = await service
      .login({ email: 'nobody@example.com', password: credentials.password })
      .catch((error: ApiError) => error);

    expect((wrongPassword as ApiError).code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    expect((unknownEmail as ApiError).code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    expect((wrongPassword as ApiError).message).toBe((unknownEmail as ApiError).message);
    expect((wrongPassword as ApiError).getStatus()).toBe((unknownEmail as ApiError).getStatus());
  });

  it('identify reports existence without leaking anything else about the account', async () => {
    const { service } = build();
    await service.register(credentials);

    await expect(service.identify(credentials.email)).resolves.toEqual({ exists: true });
    await expect(service.identify('nobody@example.com')).resolves.toEqual({ exists: false });
  });

  it('revokes the session on logout and tolerates a missing cookie', async () => {
    const { service, sessions } = build();
    await service.logout('token-for-user-1');
    await service.logout(undefined);
    expect(sessions.revoked).toEqual(['token-for-user-1']);
  });
});

describe('AccountService', () => {
  const build = async () => {
    const users = new FakeUsers();
    const sessions = new FakeSessions();
    const passwords = new PasswordService();
    const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as unknown as StructuredLogger;
    const user = await users.create({
      email: 'ada@example.com',
      passwordHash: await passwords.hash('correct horse battery staple'),
      displayName: 'Ada Lovelace',
    });
    const service = new AccountService(
      users,
      passwords,
      sessions as unknown as SessionsApi,
      logger,
    );
    return { users, sessions, service, logger, session: { userId: user.id, sessionId: 's-1' } };
  };

  it('changes the password, keeps the current session and revokes the others', async () => {
    const { service, sessions, users, session, logger } = await build();
    const result = await service.changePassword(
      session,
      'correct horse battery staple',
      'another long passphrase',
    );
    expect(result).toEqual({ success: true, revokedSessions: 2 });
    expect(sessions.revokedOthers).toEqual([[session.userId, 's-1']]);
    const stored = (await users.findByIdWithSecret(session.userId))!;
    await expect(
      new PasswordService().verify(stored.passwordHash, 'another long passphrase'),
    ).resolves.toBe(true);
    const logged = JSON.stringify([
      (logger.log as jest.Mock).mock.calls,
      (logger.warn as jest.Mock).mock.calls,
    ]);
    expect(logged).not.toContain('another long passphrase');
    expect(logged).not.toContain('correct horse battery staple');
  });

  it('rejects a wrong current password with the login error code and changes nothing', async () => {
    const { service, sessions, users, session } = await build();
    const before = (await users.findByIdWithSecret(session.userId))!.passwordHash;
    const error = await service
      .changePassword(session, 'wrong password here', 'another long passphrase')
      .catch((reason: ApiError) => reason);
    expect((error as ApiError).code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    expect((error as ApiError).getStatus()).toBe(403);
    expect((await users.findByIdWithSecret(session.userId))!.passwordHash).toBe(before);
    expect(sessions.revokedOthers).toEqual([]);
  });

  it('refuses to "change" the password to the same value', async () => {
    const { service, session } = await build();
    await expect(
      service.changePassword(session, 'correct horse battery staple', 'correct horse battery staple'),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
  });

  it('changes the e-mail only with the password and never onto a taken address', async () => {
    const { service, users, session, sessions } = await build();
    await users.create({ email: 'taken@example.com', passwordHash: 'x', displayName: 'Other' });
    await expect(
      service.changeEmail(session, 'new@example.com', 'wrong password here'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_CREDENTIALS });
    await expect(
      service.changeEmail(session, 'taken@example.com', 'correct horse battery staple'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_EMAIL_ALREADY_REGISTERED });
    const profile = await service.changeEmail(
      session,
      'new@example.com',
      'correct horse battery staple',
    );
    expect(profile.email).toBe('new@example.com');
    expect(profile).not.toHaveProperty('passwordHash');
    expect(sessions.revokedOthers).toEqual([[session.userId, 's-1']]);
  });

  it('updates the display name', async () => {
    const { service, session } = await build();
    await expect(service.updateProfile(session.userId, 'Ada King')).resolves.toMatchObject({
      displayName: 'Ada King',
    });
  });
});
