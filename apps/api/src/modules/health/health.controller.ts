import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponse, ReadinessResponse } from '@amazon-mvp/api-contract';
import { ApiConfig } from '@amazon-mvp/config-schema';
import { PrismaService } from '../../common/prisma.service';
import { API_CONFIG } from '../../config/api-config';
import { Public } from '../auth/session.guard';

/**
 * /health  -> livenessProbe: is the process alive? Must NOT touch the database,
 *             or a brief DB outage would restart every pod.
 * /ready   -> readinessProbe: can this pod serve traffic (DB reachable)?
 */
@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(API_CONFIG) private readonly config: ApiConfig,
  ) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  health(): HealthResponse {
    return { status: 'ok', service: this.config.app.name, version: process.env.APP_VERSION ?? '0.1.0' };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready(): Promise<ReadinessResponse> {
    const reachable = await this.prisma.isReachable();
    const body: ReadinessResponse = {
      status: reachable ? 'ready' : 'not-ready',
      checks: { database: reachable ? 'ok' : 'failed' },
    };
    // Kubernetes only reads the status code, so a degraded pod must not answer 200.
    if (!reachable) throw new ServiceUnavailableException(body);
    return body;
  }
}
