import 'server-only';
import { isAbsolute, join, resolve } from 'node:path';
import {
  FeatureRegistry,
  StorefrontConfig,
  StorefrontConfigSchema,
  loadConfig,
  readYamlFile,
} from '@amazon-mvp/config-schema';

const CONFIG_DIR = resolve(process.cwd(), 'config');

const ENV_MAP = {
  'app.environment': 'APP_ENV',
  'app.port': 'PORT',
  'api.internalBaseUrl': 'API_INTERNAL_URL',
  'api.publicBasePath': 'API_PUBLIC_BASE_PATH',
  featuresFile: 'FEATURES_FILE',
};

let cachedConfig: StorefrontConfig | null = null;
let cachedRegistry: FeatureRegistry | null = null;

/**
 * Validated once per process. An invalid file throws here, which surfaces as a
 * startup/render failure rather than a route quietly behaving as if disabled.
 */
export function getConfig(): StorefrontConfig {
  cachedConfig ??= loadConfig({
    configDir: CONFIG_DIR,
    environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? 'local',
    schema: StorefrontConfigSchema,
    envMap: ENV_MAP,
  });
  return cachedConfig;
}

export function getFeatureRegistry(): FeatureRegistry {
  if (cachedRegistry) return cachedRegistry;

  const config = getConfig();
  const path = isAbsolute(config.featuresFile)
    ? config.featuresFile
    : join(CONFIG_DIR, config.featuresFile);

  const raw = readYamlFile(path);
  if (raw === undefined) {
    throw new Error(`Feature configuration not found at ${path}`);
  }

  cachedRegistry = FeatureRegistry.fromConfig(raw);
  return cachedRegistry;
}

/** Test hook — production code never calls this. */
export function resetConfigCache(): void {
  cachedConfig = null;
  cachedRegistry = null;
}
