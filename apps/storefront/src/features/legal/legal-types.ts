/**
 * Shape of the legal help articles (/privacy, /conditions-of-use). Links only
 * point to routes that exist in this storefront or to anchors on the same page;
 * references to Amazon pages or URLs that do not exist here stay as plain text.
 */

/** Plain text, or text mixed with links (internal routes or `#anchors`). */
export type RichText = string | Array<string | { text: string; href: string }>;

export type LegalBlock =
  /** Paragraph; `lead` is the bold term that opens it. */
  | { kind: 'text'; lead?: string; body: RichText }
  /** Heading for a sub-part of a section, optionally an anchor target. */
  | { kind: 'subheading'; id?: string; title: string }
  /** Bulleted list; `lead` is the bold term that opens an item. */
  | { kind: 'list'; items: Array<{ lead?: string; body: RichText }> };

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  href: string;
  title: string;
  /** Meta description. */
  summary: string;
  updatedAt?: string;
  /** Breadcrumb trail above the title, as on the help article. */
  crumbs: string[];
  /** Paragraphs between the title and the table of contents. */
  intro: RichText[];
  sections: LegalSection[];
}
