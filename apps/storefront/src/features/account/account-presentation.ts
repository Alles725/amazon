import { CatalogItem } from '@amazon-mvp/api-contract';

/** Amazon starts showing "Apenas N em estoque" at this level (same as the product page). */
const LOW_STOCK = 5;

export function listHref(id: string) {
  return `/lists?list=${encodeURIComponent(id)}`;
}

export function stockLabel(product: CatalogItem): { text: string; tone: 'ok' | 'low' | 'out' } {
  if (!product.active) return { text: 'Indisponível no momento', tone: 'out' };
  if (!product.inStock) return { text: 'Fora de estoque', tone: 'out' };
  if (product.availableQuantity <= LOW_STOCK)
    return { text: `Apenas ${product.availableQuantity} em estoque`, tone: 'low' };
  return { text: 'Em estoque', tone: 'ok' };
}

export function formatPostalCode(code: string) {
  return /^\d{8}$/.test(code) ? `${code.slice(0, 5)}-${code.slice(5)}` : code;
}
