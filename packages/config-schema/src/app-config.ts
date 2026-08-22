import { z } from 'zod';

export const LogLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);

export const ApiConfigSchema = z.object({
  app: z.object({
    name: z.string().min(1),
    environment: z.enum(['local', 'development', 'production', 'test']),
    port: z.number().int().min(1).max(65535),
    logLevel: LogLevelSchema,
  }),
  database: z.object({
    url: z.string().min(1, 'database.url is required (set DATABASE_URL)'),
  }),
  session: z.object({
    cookieName: z.string().min(1),
    ttlHours: z.number().int().positive(),
    secureCookie: z.boolean(),
    sameSite: z.enum(['lax', 'strict', 'none']),
  }),
  openapi: z.object({
    enabled: z.boolean(),
    path: z.string().startsWith('/'),
  }),
});
export type ApiConfig = z.infer<typeof ApiConfigSchema>;

export const StorefrontConfigSchema = z.object({
  app: z.object({
    name: z.string().min(1),
    environment: z.enum(['local', 'development', 'production', 'test']),
    port: z.number().int().min(1).max(65535),
  }),
  api: z.object({
    /** Absolute URL used by server components/route handlers. */
    internalBaseUrl: z.string().url(),
    /** Path prefix used by the browser; same-origin via Ingress. */
    publicBasePath: z.string().startsWith('/'),
  }),
  featuresFile: z.string().min(1),
});
export type StorefrontConfig = z.infer<typeof StorefrontConfigSchema>;
