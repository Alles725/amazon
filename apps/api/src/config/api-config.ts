import { join } from 'node:path';
import { ApiConfig, ApiConfigSchema, loadConfig } from '@amazon-mvp/config-schema';

export const API_CONFIG = 'API_CONFIG';

/** Explicit env var bindings. Kubernetes Secrets/ConfigMaps land here. */
const ENV_MAP = {
  'app.environment': 'APP_ENV',
  'app.port': 'PORT',
  'app.logLevel': 'LOG_LEVEL',
  'database.url': 'DATABASE_URL',
  'session.cookieName': 'SESSION_COOKIE_NAME',
  'session.ttlHours': 'SESSION_TTL_HOURS',
  'session.secureCookie': 'SESSION_SECURE_COOKIE',
  'session.sameSite': 'SESSION_SAME_SITE',
  'openapi.enabled': 'OPENAPI_ENABLED',
};

/** Throws ConfigValidationError -> process exits before serving traffic. */
export function loadApiConfig(configDir = join(__dirname, '..', '..', 'config')): ApiConfig {
  return loadConfig({
    configDir,
    environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? 'local',
    schema: ApiConfigSchema,
    envMap: ENV_MAP,
  });
}
