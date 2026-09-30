import { CATALOG_SEARCH_MAX_LENGTH } from '@amazon-mvp/api-contract';

/**
 * Text search helpers for the catalog listing. Matching happens in PostgreSQL with
 * `translate(lower(column), ACCENTED, PLAIN) LIKE '%token%'`, so the query string is
 * normalized the same way here: lowercase, no diacritics, LIKE wildcards escaped.
 *
 * No extension (unaccent/pg_trgm) is required. For a catalog of a few hundred rows a
 * sequential scan is instant; a trigram GIN index on the same expression is the next
 * step if the catalog grows (see docs/browse.md).
 */

/** Characters folded by the SQL side; both cases, in case lower() leaves one unfolded. */
export const ACCENTED = 'áàâãäåéèêëíìîïóòôõöúùûüçñýÿÁÀÂÃÄÅÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑÝ';
export const PLAIN = 'aaaaaaeeeeiiiiooooouuuucnyyaaaaaaeeeeiiiiooooouuuucny';

const MAX_TOKENS = 8;

export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Escapes LIKE wildcards; PostgreSQL's default LIKE escape character is the backslash. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Search terms of a query: normalized, split on anything that is not a letter or digit,
 * deduplicated, at most MAX_TOKENS. A trailing plural "s" is dropped from longer words so
 * "fones" also finds "Fone" (the stem still matches the plural as a substring). One-letter
 * words are ignored when there are longer ones ("fone e mouse").
 */
export function searchTokens(query: string | undefined): string[] {
  if (!query) return [];
  const words = normalizeText(query.slice(0, CATALOG_SEARCH_MAX_LENGTH))
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const meaningful = words.some((word) => word.length > 1)
    ? words.filter((word) => word.length > 1)
    : words;
  const stems = meaningful.map((word) =>
    word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word,
  );
  return [...new Set(stems)].slice(0, MAX_TOKENS);
}

/** `%token%` LIKE pattern for a normalized token. */
export const containsPattern = (token: string): string => `%${escapeLike(token)}%`;
