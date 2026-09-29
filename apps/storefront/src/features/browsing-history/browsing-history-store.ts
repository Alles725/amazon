'use client';

import { useSyncExternalStore } from 'react';
import type { ProductPhoto } from '@/features/home/catalog-mock';

/**
 * Real, device-local browsing history: product detail pages record each visit
 * here. Nothing is fabricated — an unvisited catalog simply has no history.
 */
export interface BrowsingHistoryEntry {
  id: string;
  name: string;
  image?: ProductPhoto;
  viewedAt: string;
}

const STORAGE_KEY = 'az-browsing-history';
const CHANGE_EVENT = 'az-browsing-history-change';
const MAX_ENTRIES = 50;
const EMPTY: BrowsingHistoryEntry[] = [];

let cache: { raw: string | null; entries: BrowsingHistoryEntry[] } = { raw: null, entries: EMPTY };

function isEntry(value: unknown): value is BrowsingHistoryEntry {
  const entry = value as BrowsingHistoryEntry;
  return (
    typeof entry?.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.viewedAt === 'string' &&
    !Number.isNaN(Date.parse(entry.viewedAt))
  );
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): BrowsingHistoryEntry[] {
  const raw = readRaw();
  if (raw === cache.raw) return cache.entries;
  let entries = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) entries = parsed.filter(isEntry);
  } catch {
    entries = EMPTY;
  }
  cache = { raw, entries };
  return entries;
}

function write(entries: BrowsingHistoryEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Most recent first; a revisited product moves back to the front. */
export function recordProductView(
  product: Omit<BrowsingHistoryEntry, 'viewedAt'>,
  now = new Date(),
) {
  const rest = getSnapshot().filter((entry) => entry.id !== product.id);
  write([{ ...product, viewedAt: now.toISOString() }, ...rest].slice(0, MAX_ENTRIES));
}

export function removeProductView(id: string) {
  write(getSnapshot().filter((entry) => entry.id !== id));
}

export function clearBrowsingHistory() {
  write([]);
}

export function useBrowsingHistory() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Amazon's timeline labels: "Hoje", "Ontem", then "Sáb, Set 26". */
export function formatHistoryDay(value: string, now = new Date()) {
  const date = new Date(value);
  const days = Math.round((dayStart(now).getTime() - dayStart(date).getTime()) / 86_400_000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}
