import type { IconName } from './corporate-icons';
import type { CorporateGroupId, CorporatePageKey } from './corporate-routes';

/**
 * Content model for the footer's corporate pages. Every page is plain data
 * (strings only) rendered by one template — see corporate-body.tsx.
 *
 * Content rule (academic project): describe what an area is about in general,
 * evergreen terms. Never invent statistics, dates, names, addresses, job
 * openings, press releases or papers — use a `notice` block instead.
 */

/** Internal store route or in-page anchor. External URLs are not allowed. */
export type CorporateAction = { label: string; href: string };

export type CorporateCard = {
  icon: IconName;
  title: string;
  text: string;
  action?: CorporateAction;
};

export type CorporateStep = { title: string; text: string };

export type CorporateFaqItem = { question: string; answer: string[] };

type BlockBase = { id: string; title: string; intro?: string };

export type CorporateBlock =
  | (BlockBase & {
      kind: 'split';
      eyebrow?: string;
      paragraphs: string[];
      bullets?: string[];
      icon: IconName;
      action?: CorporateAction;
    })
  | (BlockBase & { kind: 'cards'; cards: CorporateCard[]; note?: string })
  | (BlockBase & { kind: 'steps'; steps: CorporateStep[] })
  | (BlockBase & {
      kind: 'compare';
      columns: [string, string];
      rows: { label: string; values: [string, string] }[];
      caption: string;
    })
  | (BlockBase & {
      kind: 'notice';
      message: string;
      detail: string;
      action?: CorporateAction;
    })
  | (BlockBase & { kind: 'faq'; items: CorporateFaqItem[] })
  | (BlockBase & { kind: 'cta'; text: string; actions: CorporateAction[] });

export type CorporateBlockKind = CorporateBlock['kind'];

export type CorporateHeroTone = 'ink' | 'sky' | 'sand';

export type CorporatePage = {
  key: CorporatePageKey;
  href: string;
  group: CorporateGroupId;
  /** Browser title prefix and FeatureRoute/Coming Soon title. */
  title: string;
  /** Meta description (<= 160 chars). */
  description: string;
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    icon: IconName;
    tone: CorporateHeroTone;
    actions?: CorporateAction[];
  };
  blocks: CorporateBlock[];
};
