import { ErrorCode } from '@amazon-mvp/api-contract';
import { ApiError } from '../../common/api-error';
import { StructuredLogger } from '../../common/structured-logger';
import { UsersApi, UserRecord, UserWithSecret } from '../users/users.api';
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

  it('revokes the session on logout and tolerates a missing cookie', async () => {
    const { service, sessions } = build();
    await service.logout('token-for-user-1');
    await service.logout(undefined);
    expect(sessions.revoked).toEqual(['token-for-user-1']);
  });
});
