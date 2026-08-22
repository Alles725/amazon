import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiConfig } from '@amazon-mvp/config-schema';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { StructuredLogger } from './common/structured-logger';
import { API_CONFIG } from './config/api-config';

/**
 * Shared by main.ts, the OpenAPI generator and integration tests, so all three
 * exercise exactly the same wiring.
 */
export async function createApp(): Promise<{ app: INestApplication; config: ApiConfig }> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get<ApiConfig>(API_CONFIG);
  const logger = app.get(StructuredLogger);
  logger.setLevel(config.app.logLevel);
  app.useLogger(logger);

  // Probes stay unversioned at the root; everything else lives under /api/v1.
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'ready'] });
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  // Same-origin through the Ingress, so CORS is intentionally not enabled.
  app.enableShutdownHooks();

  return { app, config };
}

export function buildOpenApiDocument(app: INestApplication) {
  const builder = new DocumentBuilder()
    .setTitle('Amazon MVP API')
    .setDescription('Modular monolith API for the MVP skeleton. Sessions are opaque cookies.')
    .setVersion('1.0.0')
    .addCookieAuth('amzmvp_sid', { type: 'apiKey', in: 'cookie', name: 'amzmvp_sid' })
    .addTag('auth')
    .addTag('health')
    .addTag('protected')
    .build();

  return SwaggerModule.createDocument(app, builder);
}
