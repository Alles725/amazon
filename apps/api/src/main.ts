import 'reflect-metadata';
import { SwaggerModule } from '@nestjs/swagger';
import { buildOpenApiDocument, createApp } from './bootstrap';
import { bootstrapLogger } from './common/structured-logger';

async function main() {
  const { app, config } = await createApp();

  if (config.openapi.enabled) {
    SwaggerModule.setup(config.openapi.path, app, buildOpenApiDocument(app), {
      useGlobalPrefix: false,
    });
  }

  await app.listen(config.app.port, '0.0.0.0');
  bootstrapLogger.log(`${config.app.name} listening on :${config.app.port} (${config.app.environment})`);
}

main().catch((error) => {
  // Invalid configuration lands here: fail fast and loudly, do not serve traffic.
  bootstrapLogger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
