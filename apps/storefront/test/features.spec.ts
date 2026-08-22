import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FeatureRegistry, readYamlFile } from '@amazon-mvp/config-schema';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';

const REPO_FEATURES = join(process.cwd(), '..', '..', 'config', 'features.yaml');

const loadShipped = () => FeatureRegistry.fromConfig(readYamlFile(REPO_FEATURES));

describe('shipped config/features.yaml', () => {
  it('is valid and fails fast if it is not', () => {
    expect(() => loadShipped()).not.toThrow();
  });

  it('keeps the authentication vertical slice enabled', () => {
    const registry = loadShipped();
    expect(registry.isEnabled('authentication')).toBe(true);
    expect(registry.isEnabled('home')).toBe(true);
  });

  it('ships unbuilt features disabled', () => {
    const registry = loadShipped();
    for (const feature of ['catalog', 'productDetails', 'cart', 'checkout', 'orders', 'account']) {
      expect(registry.isEnabled(feature)).toBe(false);
    }
  });

  it('binds every route in the storefront to a declared feature', () => {
    const registry = loadShipped();
    const routeKeys = [
      'home',
      'login',
      'register',
      'products',
      'productDetails',
      'cart',
      'checkout',
      'orders',
      'orderDetails',
      'account',
    ];
    for (const key of routeKeys) {
      expect(['enabled', 'coming-soon', 'not-found']).toContain(registry.routeState(key));
    }
  });

  it('resolves the shipped routes to their documented behaviour', () => {
    const registry = loadShipped();
    expect(registry.routeState('login')).toBe('enabled'); // feature enabled
    expect(registry.routeState('products')).toBe('coming-soon'); // disabled -> visible, marked
    expect(registry.routeState('checkout')).toBe('not-found'); // disabled -> hidden
  });
});

describe('feature registry behaviour', () => {
  const config = (overrides: string) => FeatureRegistry.fromConfig(parse(overrides));

  it('renders an enabled feature', () => {
    const registry = config(`
features:
  catalog:
    enabled: true
routes:
  products:
    feature: catalog
    disabledBehavior: coming-soon
`);
    expect(registry.routeState('products')).toBe('enabled');
  });

  it('falls back to Coming Soon when the feature is off', () => {
    const registry = config(`
features:
  catalog:
    enabled: false
routes:
  products:
    feature: catalog
    disabledBehavior: coming-soon
`);
    expect(registry.routeState('products')).toBe('coming-soon');
  });

  it('returns not-found when configured that way', () => {
    const registry = config(`
features:
  checkout:
    enabled: false
routes:
  checkout:
    feature: checkout
    disabledBehavior: not-found
`);
    expect(registry.routeState('checkout')).toBe('not-found');
  });

  it('rejects an invalid disabledBehavior instead of guessing', () => {
    expect(() =>
      config(`
features:
  cart:
    enabled: false
routes:
  cart:
    feature: cart
    disabledBehavior: maybe
`),
    ).toThrow();
  });

  it('rejects a route bound to a feature that does not exist', () => {
    expect(() =>
      config(`
features:
  cart:
    enabled: false
routes:
  cart:
    feature: basket
`),
    ).toThrow(/unknown feature/);
  });
});

describe('feature checks are centralised', () => {
  it('no component reads features.yaml or a feature env var directly', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of require('node:fs').readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(path);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(entry.name)) continue;
        const source = readFileSync(path, 'utf8');
        const isRegistry = path.includes(join('src', 'config'));
        if (!isRegistry && (source.includes('features.yaml') || /process\.env\.FEATURE_/.test(source))) {
          offenders.push(path);
        }
      }
    };
    walk(join(process.cwd(), 'src'));
    expect(offenders).toEqual([]);
  });
});
