import Link from 'next/link';
import { CorpIcon, HeroArt } from './corporate-icons';
import { CORPORATE_GROUPS } from './corporate-routes';
import type {
  CorporateAction,
  CorporateBlock,
  CorporatePage,
} from './corporate-types';

type BlockOf<K extends CorporateBlock['kind']> = Extract<CorporateBlock, { kind: K }>;

/** Everything between the Amazon header and footer of a corporate page. */
export function CorporateBody({ page }: { page: CorporatePage }) {
  return (
    <>
      <CorporateSectionBar page={page} />
      <main className="az-corp">
        <CorporateHero page={page} />
        {page.blocks.map((block, index) => (
          <CorporateSection key={block.id} block={block} band={index % 2 === 1} />
        ))}
        <p className="az-corp__disclaimer">
          <span className="az-corp__inner">
            Página informativa de um projeto acadêmico. O conteúdo descreve esta área em termos
            gerais e não representa informações oficiais da Amazon.
          </span>
        </p>
      </main>
    </>
  );
}

/** Secondary navigation across the pages of the same footer column. */
export function CorporateSectionBar({ page }: { page: CorporatePage }) {
  const group = CORPORATE_GROUPS.find((candidate) => candidate.id === page.group);
  if (!group) return null;
  return (
    <nav className="az-corp-bar" aria-label={group.label}>
      <div className="az-corp-bar__inner">
        <span className="az-corp-bar__label" aria-hidden="true">
          {group.label}
        </span>
        <ul className="az-corp-bar__links">
          {group.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="az-corp-bar__link"
                aria-current={link.href === page.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function CorporateHero({ page }: { page: CorporatePage }) {
  const { hero } = page;
  return (
    <section
      className={`az-corp-hero az-corp-hero--${hero.tone}`}
      aria-labelledby="az-corp-title"
    >
      <div className="az-corp__inner az-corp-hero__grid">
        <div className="az-corp-hero__copy">
          <p className="az-corp-hero__eyebrow">{hero.eyebrow}</p>
          <h1 id="az-corp-title" className="az-corp-hero__title">
            {hero.title}
          </h1>
          <p className="az-corp-hero__lead">{hero.lead}</p>
          {hero.actions?.length ? <Actions actions={hero.actions} /> : null}
        </div>
        <div className="az-corp-hero__media">
          <HeroArt icon={hero.icon} />
        </div>
      </div>
    </section>
  );
}

function CorporateSection({ block, band }: { block: CorporateBlock; band: boolean }) {
  const titleId = `${block.id}-title`;
  const classes = [
    'az-corp-section',
    `az-corp-section--${block.kind}`,
    band && block.kind !== 'cta' ? 'az-corp-section--band' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={block.id} className={classes} aria-labelledby={titleId}>
      <div className="az-corp__inner">
        {block.kind === 'split' ? (
          <SplitBlock block={block} titleId={titleId} reverse={band} />
        ) : block.kind === 'cta' ? (
          <CtaBlock block={block} titleId={titleId} />
        ) : (
          <>
            <header className="az-corp-section__header">
              <h2 id={titleId} className="az-corp-section__title">
                {block.title}
              </h2>
              {block.intro ? <p className="az-corp-section__intro">{block.intro}</p> : null}
            </header>
            {block.kind === 'cards' ? <CardsBlock block={block} /> : null}
            {block.kind === 'steps' ? <StepsBlock block={block} /> : null}
            {block.kind === 'compare' ? <CompareBlock block={block} /> : null}
            {block.kind === 'notice' ? <NoticeBlock block={block} /> : null}
            {block.kind === 'faq' ? <FaqBlock block={block} /> : null}
          </>
        )}
      </div>
    </section>
  );
}

function SplitBlock({
  block,
  titleId,
  reverse,
}: {
  block: BlockOf<'split'>;
  titleId: string;
  reverse: boolean;
}) {
  return (
    <div className={`az-corp-split${reverse ? ' az-corp-split--reverse' : ''}`}>
      <div className="az-corp-split__copy">
        {block.eyebrow ? <p className="az-corp-split__eyebrow">{block.eyebrow}</p> : null}
        <h2 id={titleId} className="az-corp-section__title">
          {block.title}
        </h2>
        {block.intro ? <p className="az-corp-section__intro">{block.intro}</p> : null}
        {block.paragraphs.map((paragraph, index) => (
          <p key={index} className="az-corp-split__text">
            {paragraph}
          </p>
        ))}
        {block.bullets?.length ? (
          <ul className="az-corp-split__bullets">
            {block.bullets.map((bullet) => (
              <li key={bullet}>
                <CheckIcon />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {block.action ? <TextLink action={block.action} /> : null}
      </div>
      <div className="az-corp-split__media" aria-hidden="true">
        <CorpIcon name={block.icon} size={88} />
      </div>
    </div>
  );
}

function CardsBlock({ block }: { block: BlockOf<'cards'> }) {
  return (
    <>
      <ul className={`az-corp-cards az-corp-cards--${block.cards.length % 4 === 0 ? 4 : 3}`}>
        {block.cards.map((card) => (
          <li key={card.title} className="az-corp-card">
            <span className="az-corp-card__icon">
              <CorpIcon name={card.icon} size={26} />
            </span>
            <h3 className="az-corp-card__title">{card.title}</h3>
            <p className="az-corp-card__text">{card.text}</p>
            {card.action ? <TextLink action={card.action} /> : null}
          </li>
        ))}
      </ul>
      {block.note ? (
        <p className="az-corp-cards__note">
          <CorpIcon name="info" size={18} />
          <span>{block.note}</span>
        </p>
      ) : null}
    </>
  );
}

function StepsBlock({ block }: { block: BlockOf<'steps'> }) {
  return (
    <ol className="az-corp-steps">
      {block.steps.map((step, index) => (
        <li key={step.title} className="az-corp-step">
          <span className="az-corp-step__number" aria-hidden="true">
            {index + 1}
          </span>
          <h3 className="az-corp-step__title">{step.title}</h3>
          <p className="az-corp-step__text">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

function CompareBlock({ block }: { block: BlockOf<'compare'> }) {
  return (
    <div className="az-corp-compare" role="region" aria-labelledby={`${block.id}-title`} tabIndex={0}>
      <table className="az-corp-compare__table">
        <caption className="az-corp-compare__caption">{block.caption}</caption>
        <thead>
          <tr>
            <td />
            {block.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.values.map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Honest placeholder for content this academic store deliberately does not publish. */
function NoticeBlock({ block }: { block: BlockOf<'notice'> }) {
  return (
    <div className="az-corp-notice">
      <CorpIcon name="info" size={24} className="az-corp-notice__icon" />
      <div>
        <p className="az-corp-notice__message">{block.message}</p>
        <p className="az-corp-notice__detail">{block.detail}</p>
        {block.action ? <TextLink action={block.action} /> : null}
      </div>
    </div>
  );
}

// Native <details>/<summary>: keyboard (Enter/Space) and screen-reader support
// without client JavaScript — same pattern as the /sell FAQ.
function FaqBlock({ block }: { block: BlockOf<'faq'> }) {
  return (
    <div className="az-corp-faq">
      {block.items.map((item) => (
        <details key={item.question} className="az-corp-faq__item">
          <summary className="az-corp-faq__question">
            <span>{item.question}</span>
            <PlusIcon />
          </summary>
          <div className="az-corp-faq__answer">
            {item.answer.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function CtaBlock({ block, titleId }: { block: BlockOf<'cta'>; titleId: string }) {
  return (
    <div className="az-corp-cta">
      <div>
        <h2 id={titleId} className="az-corp-cta__title">
          {block.title}
        </h2>
        <p className="az-corp-cta__text">{block.text}</p>
      </div>
      <Actions actions={block.actions} />
    </div>
  );
}

/** First action is the primary (yellow) button, the rest are secondary. */
function Actions({ actions }: { actions: CorporateAction[] }) {
  return (
    <div className="az-corp__actions">
      {actions.map((action, index) => (
        <Link
          key={action.href + action.label}
          href={action.href}
          className={`az-corp__button az-corp__button--${index === 0 ? 'primary' : 'secondary'}`}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}

function TextLink({ action }: { action: CorporateAction }) {
  return (
    <Link href={action.href} className="az-corp__text-link">
      {action.label}
      <ArrowIcon />
    </Link>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" focusable="false">
      <path
        d="M4 10h11m-4-4.5L15.5 10 11 14.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="m4.5 10.5 3.5 3.5 7.5-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
      className="az-corp-faq__plus"
    >
      <path d="M2 10h16" stroke="currentColor" strokeWidth="2" />
      <path className="az-corp-faq__plus-v" d="M10 2v16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
