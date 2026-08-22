import 'server-only';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ComingSoon } from '@/components/coming-soon';
import { getFeatureRegistry } from './storefront-config';

/**
 * The ONLY place a page asks "is this on?". Pages call FeatureRoute; components
 * inside a page call FeatureGate. No component reads the YAML or an env var.
 */
export function FeatureRoute({
  routeKey,
  title,
  children,
}: {
  routeKey: string;
  title: string;
  children: ReactNode;
}) {
  const state = getFeatureRegistry().routeState(routeKey);

  if (state === 'not-found') notFound();
  if (state === 'coming-soon') return <ComingSoon title={title} />;
  return <>{children}</>;
}

/** Conditional rendering inside an enabled page (e.g. hide a "Cart" nav link). */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return getFeatureRegistry().isEnabled(feature) ? <>{children}</> : <>{fallback}</>;
}

export function isFeatureEnabled(feature: string): boolean {
  return getFeatureRegistry().isEnabled(feature);
}
