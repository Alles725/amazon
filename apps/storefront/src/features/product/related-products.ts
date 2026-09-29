import type { CatalogItem } from '@amazon-mvp/api-contract';

/** What the recommender knows about a product beyond its catalog record. */
export interface RelatedFacts {
  brand?: string;
  /** Variant family (Amazon parent ASIN): its members collapse into one card. */
  family?: string;
  /** The family's head record, the card the Home shows for the whole family. */
  familyHead?: boolean;
  attributes: Array<{ label: string; value: string }>;
}

export interface RelatedCandidate {
  item: CatalogItem;
  /** 0 = one of the product's own categories, 1 = the breadcrumb parent, and so on. */
  distance: number;
  /** How many of the product's own categories list this candidate (a headset shares
   * "Headsets" AND "Periféricos Gamer" with another headset, a keyboard only the latter). */
  sharedCategories?: number;
  facts: RelatedFacts;
}

// A price 4x higher or lower than the product's no longer counts as "similar".
const PRICE_RANGE = Math.log(4);

function affinity(target: RelatedFacts & { priceMinor: number }, candidate: RelatedCandidate) {
  const sameBrand = target.brand !== undefined && candidate.facts.brand === target.brand;
  const sharedAttributes = candidate.facts.attributes.filter((attribute) =>
    target.attributes.some((own) => own.label === attribute.label && own.value === attribute.value),
  ).length;
  const ratio = Math.abs(
    Math.log(Math.max(1, candidate.item.priceMinor) / Math.max(1, target.priceMinor)),
  );
  const priceCloseness = 1 - Math.min(1, ratio / PRICE_RANGE);
  return (sameBrand ? 4 : 0) + Math.min(3, sharedAttributes) + 3 * priceCloseness;
}

/** Orders candidates by category distance first (same category, then its parent,
 * never another department) and by how many categories they share, then availability,
 * then affinity: same brand, shared attributes (e.g. the same colour) and a similar
 * price. Each variant family shows once — its best-matching member, else its head —
 * and the product's own family never appears. */
export function rankRelated(
  target: { item: CatalogItem; facts: RelatedFacts },
  candidates: RelatedCandidate[],
  limit: number,
): CatalogItem[] {
  const own = { ...target.facts, priceMinor: target.item.priceMinor };
  const ranked = candidates
    .filter(({ item, facts }) => {
      const sameFamily = own.family !== undefined && facts.family === own.family;
      return item.active && item.id !== target.item.id && !sameFamily;
    })
    .map((candidate) => ({ candidate, score: affinity(own, candidate) }))
    .sort(
      (a, b) =>
        a.candidate.distance - b.candidate.distance ||
        (b.candidate.sharedCategories ?? 1) - (a.candidate.sharedCategories ?? 1) ||
        Number(b.candidate.item.inStock) - Number(a.candidate.item.inStock) ||
        b.score - a.score ||
        Number(Boolean(b.candidate.facts.familyHead)) -
          Number(Boolean(a.candidate.facts.familyHead)) ||
        a.candidate.item.name.localeCompare(b.candidate.item.name, 'pt-BR'),
    );
  const shown = new Set<string>();
  const result: CatalogItem[] = [];
  for (const { candidate } of ranked) {
    const key = candidate.facts.family ?? candidate.item.id;
    if (shown.has(key) || shown.has(candidate.item.id)) continue;
    shown.add(key).add(candidate.item.id);
    result.push(candidate.item);
    if (result.length === limit) break;
  }
  return result;
}

/** Distinct cards a candidate list can produce (a family counts once). */
export const distinctCards = (candidates: RelatedCandidate[]): number =>
  new Set(candidates.map(({ item, facts }) => facts.family ?? item.id)).size;
