import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ApiConfig } from '@amazon-mvp/config-schema';
import { PrismaClient } from '@amazon-mvp/database';
import { API_CONFIG } from '../config/api-config';

/**
 * The ONLY place that owns a database connection. Module repositories inject
 * this; no module reads another module's tables.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(API_CONFIG) config: ApiConfig) {
    super({ datasources: { db: { url: config.database.url } } });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Used by /ready. Cheap round-trip, no table dependency. */
  async isReachable(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
