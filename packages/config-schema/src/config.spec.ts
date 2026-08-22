import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ApiConfigSchema } from './app-config';
import { FeatureRegistry } from './features';
import { ConfigValidationError, applyEnvOverrides, loadConfig, mergeDeep } from './loader';

const baseFeatures = {
  features: {
    authentication: { enabled: true },
    catalog: { enabled: false },
    checkout: { enabled: false },
  },
  routes: {
    products: { feature: 'catalog', disabledBehavior: 'coming-soon' },
    checkout: { feature: 'checkout', disabledBehavior: 'not-found' },
    login: { feature: 'authentication', disabledBehavior: 'coming-soon' },
  },
};

describe('FeatureRegistry', () => {
  it('reports enabled features', () => {
    const registry = FeatureRegistry.fromConfig(baseFeatures);
    expect(registry.isEnabled('authentication')).toBe(true);
    expect(registry.isEnabled('catalog')).toBe(false);
    expect(registry.enabledFeatures()).toEqual(['authentication']);
  });

  it('treats unknown features as disabled', () => {
    const registry = FeatureRegistry.fromConfig(baseFeatures);
    expect(registry.isEnabled('warehouse')).toBe(false);
  });

  it('resolves route state from the backing feature', () => {
    const registry = FeatureRegistry.fromConfig(baseFeatures);
    expect(registry.routeState('login')).toBe('enabled');
    expect(registry.routeState('products')).toBe('coming-soon');
    expect(registry.routeState('checkout')).toBe('not-found');
  });

  it('leaves unregistered routes ungated', () => {
    const registry = FeatureRegistry.fromConfig(baseFeatures);
    expect(registry.routeState('health')).toBe('enabled');
  });

  it('defaults disabledBehavior to coming-soon', () => {
    const registry = FeatureRegistry.fromConfig({
      features: { cart: { enabled: false } },
      routes: { cart: { feature: 'cart' } },
    });
    expect(registry.routeState('cart')).toBe('coming-soon');
  });

  it('rejects a route bound to an unknown feature', () => {
    expect(() =>
      FeatureRegistry.fromConfig({
        features: { cart: { enabled: true } },
        routes: { cart: { feature: 'crat' } },
      }),
    ).toThrow(/unknown feature/);
  });

  it('rejects a non-boolean enabled value', () => {
    expect(() =>
      FeatureRegistry.fromConfig({ features: { cart: { enabled: 'yes' } } }),
    ).toThrow();
  });
});

describe('mergeDeep', () => {
  it('merges nested objects with later sources winning', () => {
    expect(mergeDeep({ a: { b: 1, c: 2 } }, { a: { c: 3 } })).toEqual({ a: { b: 1, c: 3 } });
  });
});

describe('applyEnvOverrides', () => {
  it('overrides nested paths and coerces scalars', () => {
    const result = applyEnvOverrides(
      { app: { port: 3000, logLevel: 'info' }, openapi: { enabled: true } },
      { 'app.port': 'PORT', 'openapi.enabled': 'OPENAPI_ENABLED' },
      { PORT: '8080', OPENAPI_ENABLED: 'false' },
    );
    expect(result).toEqual({ app: { port: 8080, logLevel: 'info' }, openapi: { enabled: false } });
  });

  it('ignores unset and empty env vars', () => {
    const result = applyEnvOverrides({ app: { port: 3000 } }, { 'app.port': 'PORT' }, { PORT: '' });
    expect(result).toEqual({ app: { port: 3000 } });
  });
});

describe('loadConfig', () => {
  const writeConfigDir = (files: Record<string, string>) => {
    const dir = mkdtempSync(join(tmpdir(), 'cfg-'));
    for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
    return dir;
  };

  const defaultYaml = `
app:
  name: api
  environment: local
  port: 3000
  logLevel: info
database:
  url: postgresql://localhost:5432/dev
session:
  cookieName: sid
  ttlHours: 24
  secureCookie: false
  sameSite: lax
openapi:
  enabled: true
  path: /api/docs
`;

  it('applies defaults -> environment yaml -> env vars in order', () => {
    const dir = writeConfigDir({
      'default.yaml': defaultYaml,
      'production.yaml': 'app:\n  environment: production\nsession:\n  secureCookie: true\n',
    });

    const config = loadConfig({
      configDir: dir,
      environment: 'production',
      schema: ApiConfigSchema,
      envMap: { 'app.port': 'PORT', 'database.url': 'DATABASE_URL' },
      env: { PORT: '8080', DATABASE_URL: 'postgresql://db:5432/prod' },
    });

    expect(config.app.environment).toBe('production'); // env yaml beat defaults
    expect(config.session.secureCookie).toBe(true);
    expect(config.app.port).toBe(8080); // env var beat yaml
    expect(config.database.url).toBe('postgresql://db:5432/prod');
    expect(config.app.logLevel).toBe('info'); // untouched default
  });

  it('fails fast with a readable error on invalid configuration', () => {
    const dir = writeConfigDir({
      'default.yaml': defaultYaml,
      'local.yaml': 'app:\n  port: not-a-number\n',
    });

    expect(() =>
      loadConfig({ configDir: dir, environment: 'local', schema: ApiConfigSchema, env: {} }),
    ).toThrow(ConfigValidationError);
  });

  it('fails when a required secret is missing entirely', () => {
    const dir = writeConfigDir({
      'default.yaml': defaultYaml.replace('  url: postgresql://localhost:5432/dev', '  url: ""'),
    });

    expect(() =>
      loadConfig({ configDir: dir, environment: 'local', schema: ApiConfigSchema, env: {} }),
    ).toThrow(/database.url is required/);
  });
});
