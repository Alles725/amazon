import { Inject, Injectable } from '@nestjs/common';
import { ApiConfig } from '@amazon-mvp/config-schema';
import { PrismaService } from '../../common/prisma.service';
import { API_CONFIG } from '../../config/api-config';
import { generateSessionToken, hashSessionToken } from './session-token';
import { ActiveSession, IssuedSession, SessionMeta, SessionsApi } from './sessions.api';

@Injectable()
export class SessionService implements SessionsApi {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(API_CONFIG) private readonly config: ApiConfig,
  ) {}

  async issue(userId: string, meta: SessionMeta = {}): Promise<IssuedSession> {
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + this.config.session.ttlHours * 3600_000);

    await this.prisma.session.create({
      data: {
        userId,
        tokenHash: hashSessionToken(token),
        expiresAt,
        userAgent: meta.userAgent?.slice(0, 512),
        ipAddress: meta.ipAddress?.slice(0, 64),
      },
    });

    // The plaintext token is returned once and never stored.
    return { token, expiresAt };
  }

  /** Returns null for unknown, expired or revoked tokens — all indistinguishable. */
  async validate(token: string | undefined): Promise<ActiveSession | null> {
    if (!token) return null;

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      select: { id: true, userId: true, expiresAt: true, revokedAt: true },
    });

    if (!session) return null;
    if (session.revokedAt !== null) return null;
    if (session.expiresAt.getTime() <= Date.now()) return null;

    return { sessionId: session.id, userId: session.userId, expiresAt: session.expiresAt };
  }

  /** Idempotent: logging out twice is not an error. */
  async revoke(token: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { tokenHash: hashSessionToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }

  /** Housekeeping for expired rows. Called by an operator or a future CronJob. */
  async purgeExpired(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}
