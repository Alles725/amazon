import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

export class ConfigValidationError extends Error {
  constructor(
    message: string,
    readonly issues: z.ZodIssue[] = [],
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

export function readYamlFile(path: string): unknown {
  if (!existsSync(path)) return undefined;
  return parseYaml(readFileSync(path, 'utf8')) ?? {};
}

type Plain = Record<string, unknown>;

const isPlainObject = (value: unknown): value is Plain =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Deep merge where later sources win. Arrays are replaced, not concatenated. */
export function mergeDeep(...sources: unknown[]): Plain {
  const out: Plain = {};
  for (const source of sources) {
    if (!isPlainObject(source)) continue;
    for (const [key, value] of Object.entries(source)) {
      out[key] = isPlainObject(value) && isPlainObject(out[key])
        ? mergeDeep(out[key], value)
        : value;
    }
  }
  return out;
}

/** Explicit `dotted.path` -> ENV_VAR map. No magic name derivation. */
export type EnvMap = Record<string, string>;

function coerce(raw: string): unknown {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw !== '' && !Number.isNaN(Number(raw))) return Number(raw);
  return raw;
}

export function applyEnvOverrides(
  base: Plain,
  envMap: EnvMap,
  env: NodeJS.ProcessEnv = process.env,
): Plain {
  const out = structuredClone(base);
  for (const [path, envVar] of Object.entries(envMap)) {
    const raw = env[envVar];
    if (raw === undefined || raw === '') continue;
    const segments = path.split('.');
    let cursor: Plain = out;
    for (const segment of segments.slice(0, -1)) {
      if (!isPlainObject(cursor[segment])) cursor[segment] = {};
      cursor = cursor[segment] as Plain;
    }
    cursor[segments[segments.length - 1]] = coerce(raw);
  }
  return out;
}

export interface LoadOptions<T extends z.ZodTypeAny> {
  /** Directory holding default.yaml / <env>.yaml */
  configDir: string;
  /** Usually NODE_ENV. */
  environment: string;
  schema: T;
  envMap?: EnvMap;
  env?: NodeJS.ProcessEnv;
}

/**
 * Precedence: config/default.yaml -> config/<environment>.yaml -> env vars
 * (Kubernetes Secrets arrive as env vars, so they are the last word).
 * Throws ConfigValidationError so the process can fail fast at startup.
 */
export function loadConfig<T extends z.ZodTypeAny>(options: LoadOptions<T>): z.infer<T> {
  const defaults = readYamlFile(join(options.configDir, 'default.yaml'));
  const perEnv = readYamlFile(join(options.configDir, `${options.environment}.yaml`));

  const merged = applyEnvOverrides(
    mergeDeep(defaults, perEnv),
    options.envMap ?? {},
    options.env ?? process.env,
  );

  const result = options.schema.safeParse(merged);
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new ConfigValidationError(
      `Invalid configuration for environment "${options.environment}":\n${detail}`,
      result.error.issues,
    );
  }
  return result.data;
}
