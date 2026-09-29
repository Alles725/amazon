'use client';

import { useEffect } from 'react';
import type { ProductPhoto } from '@/features/home/catalog-mock';
import { recordProductView } from './browsing-history-store';

/** Rendered by the product detail page so each visit lands in the browsing history. */
export function RecordProductView({
  id,
  name,
  image,
}: {
  id: string;
  name: string;
  image?: ProductPhoto;
}) {
  useEffect(() => {
    recordProductView({ id, name, image });
  }, [id, name, image]);
  return null;
}
