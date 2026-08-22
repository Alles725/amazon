import { z } from 'zod';

/**
 * Behaviour applied to a route whose backing feature is disabled.
 *
 * - `coming-soon` renders the shared ComingSoon page (route stays discoverable)
 * - `not-found`   renders a 404 (route is hidden entirely)
 */
export const DisabledBehaviorSchema = z.enum(['coming-soon', 'not-found']);
export type DisabledBehavior = z.infer<typeof DisabledBehaviorSchema>;

/** Resolved state of a route, consumed by FeatureRoute / FeatureGate. */
export type RouteState = 'enabled' | 'coming-soon' | 'not-found';

export const FeatureSchema = z.object({
  enabled: z.boolean(),
  description: z.string().optional(),
});

export const RouteBindingSchema = z.object({
  feature: z.string().min(1),
  disabledBehavior: DisabledBehaviorSchema.default('coming-soon'),
});

export const FeatureConfigSchema = z
  .object({
    features: z.record(z.string().min(1), FeatureSchema),
    routes: z.record(z.string().min(1), RouteBindingSchema).default({}),
  })
  .superRefine((config, ctx) => {
    // Fail fast on routes pointing at features that do not exist. Without this
    // check a typo silently degrades to "feature missing => treated as off".
    for (const [routeKey, binding] of Object.entries(config.routes)) {
      if (!config.features[binding.feature]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['routes', routeKey, 'feature'],
          message: `Route "${routeKey}" references unknown feature "${binding.feature}"`,
        });
      }
    }
  });

export type FeatureConfig = z.infer<typeof FeatureConfigSchema>;

/**
 * Single source of truth for "is this on?". Components never read the YAML or
 * process.env directly — they ask the registry.
 */
export class FeatureRegistry {
  private constructor(private readonly config: FeatureConfig) {}

  /** Validates raw (already parsed) YAML. Throws ZodError on invalid input. */
  static fromConfig(raw: unknown): FeatureRegistry {
    return new FeatureRegistry(FeatureConfigSchema.parse(raw));
  }

  isEnabled(feature: string): boolean {
    return this.config.features[feature]?.enabled ?? false;
  }

  /** Unknown routes are `enabled`: an unregistered route is not feature-gated. */
  routeState(routeKey: string): RouteState {
    const binding = this.config.routes[routeKey];
    if (!binding) return 'enabled';
    if (this.isEnabled(binding.feature)) return 'enabled';
    return binding.disabledBehavior;
  }

  enabledFeatures(): string[] {
    return Object.entries(this.config.features)
      .filter(([, feature]) => feature.enabled)
      .map(([name]) => name)
      .sort();
  }

  snapshot(): FeatureConfig {
    return this.config;
  }
}
