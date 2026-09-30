import type { CatalogCategoryNode, CatalogFacets } from '@amazon-mvp/api-contract';
import { brandKey } from './browse-params';

/** Pure view-model helpers of the listing page (tested without React or the API). */

export interface CategoryTree {
  bySlug: Map<string, CatalogCategoryNode>;
  children: Map<string | null, CatalogCategoryNode[]>;
}

export function buildCategoryTree(nodes: CatalogCategoryNode[]): CategoryTree {
  const bySlug = new Map(nodes.map((node) => [node.slug, node]));
  const children = new Map<string | null, CatalogCategoryNode[]>();
  for (const node of nodes) {
    // A parent that is not in the list makes the node a root instead of hiding it.
    const parent = node.parentSlug && bySlug.has(node.parentSlug) ? node.parentSlug : null;
    children.set(parent, [...(children.get(parent) ?? []), node]);
  }
  const byName = (a: CatalogCategoryNode, b: CatalogCategoryNode) =>
    a.name.localeCompare(b.name, 'pt-BR');
  for (const list of children.values()) list.sort(byName);
  return { bySlug, children };
}

/** Root → category chain; a corrupted cycle stops instead of looping. */
export function categoryTrail(tree: CategoryTree, slug: string): CatalogCategoryNode[] {
  const trail: CatalogCategoryNode[] = [];
  let current = tree.bySlug.get(slug);
  while (current && !trail.includes(current) && trail.length < 20) {
    trail.unshift(current);
    current = current.parentSlug ? tree.bySlug.get(current.parentSlug) : undefined;
  }
  return trail;
}

export interface DepartmentFacet {
  /** Ancestors of the selected category (links up the tree). */
  trail: CatalogCategoryNode[];
  selected: CatalogCategoryNode | null;
  /** Children of the selection (or roots) that have results, with their counts. */
  options: Array<{ node: CatalogCategoryNode; count: number }>;
}

/** Amazon-style "Departamento": the path to the selected category, then its sub-
 * categories that actually contain results. Nothing is listed without a count. */
export function departmentFacet(
  tree: CategoryTree,
  counts: CatalogFacets['categories'],
  selectedSlug: string,
): DepartmentFacet {
  const countOf = new Map(counts.map((row) => [row.slug, row.count]));
  const trail = selectedSlug ? categoryTrail(tree, selectedSlug) : [];
  const selected = trail[trail.length - 1] ?? null;
  const options = (tree.children.get(selected?.slug ?? null) ?? [])
    .map((node) => ({ node, count: countOf.get(node.slug) ?? 0 }))
    .filter((option) => option.count > 0);
  return { trail: trail.slice(0, -1), selected, options };
}

export interface BrandOption {
  name: string;
  key: string;
  count: number;
}

/** Brands of the matched products (brand is presentation data, looked up per slug),
 * most frequent first. Products without a brand are simply not counted. */
export function brandFacet(
  slugs: string[],
  brandOf: (slug: string) => string | undefined,
): BrandOption[] {
  const counts = new Map<string, number>();
  for (const slug of slugs) {
    const brand = brandOf(slug);
    if (brand) counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, key: brandKey(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Heading of the listing: the search, else the brand, else the category. */
export function listingTitle({
  q,
  categoryName,
  brandName,
}: {
  q: string;
  categoryName?: string;
  brandName?: string;
}): string {
  if (q) return `Resultados para “${q}”${categoryName ? ` em ${categoryName}` : ''}`;
  if (brandName) return categoryName ? `${brandName} em ${categoryName}` : brandName;
  return categoryName ?? 'Todos os produtos';
}

/** "1-48 de 150 resultados", "1 resultado", "49-60 de 60 resultados". */
export function resultsSummary(page: number, pageSize: number, total: number): string {
  const count = total.toLocaleString('pt-BR');
  if (total === 1) return '1 resultado';
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(total, page * pageSize);
  if (total <= pageSize && page === 1) return `${count} resultados`;
  return `${firstItem.toLocaleString('pt-BR')}-${lastItem.toLocaleString('pt-BR')} de ${count} resultados`;
}

export const lastPage = (total: number, pageSize: number): number =>
  Math.max(1, Math.ceil(total / pageSize));

/** Page links around the current page: always the first and last, the current one and
 * its neighbours, with 'gap' where pages are skipped ("1 … 4 5 6 … 20"). */
export function pageWindow(page: number, last: number): Array<number | 'gap'> {
  const pages = new Set([1, last, page - 1, page, page + 1].filter((n) => n >= 1 && n <= last));
  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | 'gap'> = [];
  for (const [index, value] of sorted.entries()) {
    const previous = sorted[index - 1];
    if (previous !== undefined && value - previous === 2) result.push(value - 1);
    else if (previous !== undefined && value - previous > 2) result.push('gap');
    result.push(value);
  }
  return result;
}
