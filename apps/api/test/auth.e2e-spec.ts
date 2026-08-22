import { INestApplication } from '@nestjs/common';
import { AUTH_ROUTES, ErrorCode } from '@amazon-mvp/api-contract';
import request from 'supertest';
import { createApp } from '../src/bootstrap';
import { PrismaService } from '../src/common/prisma.service';
import { SessionService } from '../src/modules/auth/session.service';
import { hashSessionToken } from '../src/modules/auth/session-token';

/**
 * Requires PostgreSQL with migrations applied:
 *   make migrate && pnpm --filter @amazon-mvp/api test:integration
 */
describe('authentication (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cookieName: string;

  const unique = () => `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = 'correct horse battery staple';

  const cookieValue = (response: request.Response): string => {
    const raw = response.headers['set-cookie'] as unknown as string[] | undefined;
    const header = (raw ?? []).find((entry) => entry.startsWith(`${cookieName}=`));
    if (!header) throw new Error('session cookie not set');
    return header.split(';')[0];
  };

  beforeAll(async () => {
    const created = await createApp();
    app = created.app;
    cookieName = created.config.session.cookieName;
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('registers a user and sets an HttpOnly session cookie', async () => {
    const email = unique();
    const response = await request(app.getHttpServer())
      .post(AUTH_ROUTES.register)
      .send({ email, password, displayName: 'Ada Lovelace' })
      .expect(201);

    expect(response.body.user.email).toBe(email);
    expect(response.body.user).not.toHaveProperty('passwordHash');

    const header = (response.headers['set-cookie'] as unknown as string[]).join(';');
    expect(header).toContain('HttpOnly');

    const stored = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(stored.passwordHash.startsWith('$argon2id$')).toBe(true);
    expect(stored.passwordHash).not.toContain(password);
  });

  it('rejects a duplicate registration', async () => {
    const email = unique();
    const payload = { email, password, displayName: 'Ada Lovelace' };
    await request(app.getHttpServer()).post(AUTH_ROUTES.register).send(payload).expect(201);

    const response = await request(app.getHttpServer())
      .post(AUTH_ROUTES.register)
      .send(payload)
      .expect(409);

    expect(response.body.error.code).toBe(ErrorCode.AUTH_EMAIL_ALREADY_REGISTERED);
    expect(response.body.error.requestId).toBeTruthy();
  });

  it('rejects an invalid registration payload with field details', async () => {
    const response = await request(app.getHttpServer())
      .post(AUTH_ROUTES.register)
      .send({ email: 'not-an-email', password: 'short', displayName: '' })
      .expect(400);

    expect(response.body.error.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(response.body.error.details.length).toBeGreaterThan(0);
  });

  it('logs in, persists authentication across requests and logs out', async () => {
    const email = unique();
    await request(app.getHttpServer())
      .post(AUTH_ROUTES.register)
      .send({ email, password, displayName: 'Ada Lovelace' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post(AUTH_ROUTES.login)
      .send({ email, password })
      .expect(200);
    const cookie = cookieValue(login);

    const me = await request(app.getHttpServer())
      .get(AUTH_ROUTES.me)
      .set('Cookie', cookie)
      .expect(200);
    expect(me.body.user.email).toBe(email);

    await request(app.getHttpServer())
      .get(AUTH_ROUTES.protectedExample)
      .set('Cookie', cookie)
      .expect(200);

    await request(app.getHttpServer()).post(AUTH_ROUTES.logout).set('Cookie', cookie).expect(200);

    // The same cookie must now be worthless.
    await request(app.getHttpServer()).get(AUTH_ROUTES.me).set('Cookie', cookie).expect(401);
  });

  it('rejects an invalid password with a generic error', async () => {
    const email = unique();
    await request(app.getHttpServer())
      .post(AUTH_ROUTES.register)
      .send({ email, password, displayName: 'Ada Lovelace' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(AUTH_ROUTES.login)
      .send({ email, password: 'wrong password entirely' })
      .expect(401);

    expect(response.body.error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    expect(response.body.error.message).toBe('Invalid credentials');
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('rejects anonymous access to protected routes', async () => {
    await request(app.getHttpServer()).get(AUTH_ROUTES.me).expect(401);
    const response = await request(app.getHttpServer())
      .get(AUTH_ROUTES.protectedExample)
      .expect(401);
    expect(response.body.error.code).toBe(ErrorCode.AUTH_SESSION_REQUIRED);
  });

  it('rejects a forged session token', async () => {
    await request(app.getHttpServer())
      .get(AUTH_ROUTES.me)
      .set('Cookie', `${cookieName}=totally-made-up-token`)
      .expect(401);
  });

  it('rejects an expired session', async () => {
    const email = unique();
    const register = await request(app.getHttpServer())
      .post(AUTH_ROUTES.register)
      .send({ email, password, displayName: 'Ada Lovelace' })
      .expect(201);
    const cookie = cookieValue(register);
    const token = cookie.split('=')[1];

    // Backdate expiry rather than waiting for the TTL.
    await prisma.session.update({
      where: { tokenHash: hashSessionToken(token) },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await request(app.getHttpServer()).get(AUTH_ROUTES.me).set('Cookie', cookie).expect(401);
  });

  it('stores only a hash of the session token', async () => {
    const email = unique();
    const register = await request(app.getHttpServer())
      .post(AUTH_ROUTES.register)
      .send({ email, password, displayName: 'Ada Lovelace' })
      .expect(201);
    const token = cookieValue(register).split('=')[1];

    const rows = await prisma.session.findMany({ select: { tokenHash: true } });
    expect(rows.some((row) => row.tokenHash === token)).toBe(false);
    expect(rows.some((row) => row.tokenHash === hashSessionToken(token))).toBe(true);
  });

  it('revokes every session for a user', async () => {
    const email = unique();
    await request(app.getHttpServer())
      .post(AUTH_ROUTES.register)
      .send({ email, password, displayName: 'Ada Lovelace' })
      .expect(201);
    const first = cookieValue(await request(app.getHttpServer()).post(AUTH_ROUTES.login).send({ email, password }));
    const second = cookieValue(await request(app.getHttpServer()).post(AUTH_ROUTES.login).send({ email, password }));

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    await app.get(SessionService).revokeAllForUser(user.id);

    await request(app.getHttpServer()).get(AUTH_ROUTES.me).set('Cookie', first).expect(401);
    await request(app.getHttpServer()).get(AUTH_ROUTES.me).set('Cookie', second).expect(401);
  });

  it('serves liveness and readiness probes without a session', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
    const ready = await request(app.getHttpServer()).get('/ready').expect(200);
    expect(ready.body.checks.database).toBe('ok');
  });
});
