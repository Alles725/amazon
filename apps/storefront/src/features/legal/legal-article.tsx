import { Fragment } from 'react';
import Link from 'next/link';
import { LEGAL_POLICIES } from './legal-nav';
import { LegalSearch } from './legal-search';
import type { LegalBlock, LegalDocument, RichText } from './legal-types';

function Rich({ text }: { text: RichText }) {
  if (typeof text === 'string') return <>{text}</>;
  return (
    <>
      {text.map((part, index) =>
        typeof part === 'string' ? (
          <Fragment key={index}>{part}</Fragment>
        ) : part.href.startsWith('#') ? (
          <a key={index} href={part.href} className="az-legal__link">
            {part.text}
          </a>
        ) : (
          <Link key={index} href={part.href} className="az-legal__link">
            {part.text}
          </Link>
        ),
      )}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case 'text':
      return (
        <p className="az-legal__text">
          {block.lead && <strong>{block.lead}</strong>} <Rich text={block.body} />
        </p>
      );
    case 'subheading':
      return (
        <h3 id={block.id} className="az-legal__subheading">
          {block.title}
        </h3>
      );
    case 'list':
      return (
        <ul className="az-legal__list">
          {block.items.map((item, index) => (
            <li key={index}>
              {item.lead && <strong>{item.lead}</strong>} <Rich text={item.body} />
            </li>
          ))}
        </ul>
      );
  }
}

function PoliciesNav({ currentHref }: { currentHref: string }) {
  return (
    <aside className="az-legal__aside">
      <Link href="/help" className="az-legal__aside-back">
        <span aria-hidden="true">‹</span> Todos os tópicos da Ajuda
      </Link>
      <nav className="az-legal__aside-nav" aria-labelledby="az-legal-aside-title">
        <h2 id="az-legal-aside-title" className="az-legal__aside-title">
          Políticas legais
        </h2>
        <ul>
          {LEGAL_POLICIES.map((policy) => (
            <li key={policy.title}>
              {policy.href ? (
                <Link
                  href={policy.href}
                  className="az-legal__aside-link"
                  aria-current={policy.href === currentHref ? 'page' : undefined}
                >
                  {policy.title}
                </Link>
              ) : (
                <span className="az-legal__aside-link">{policy.title}</span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

/** Legal help article as on amazon.com.br: "Políticas legais" sidebar, then
 * search, breadcrumb, title, table of contents and sections. */
export function LegalArticle({ doc }: { doc: LegalDocument }) {
  return (
    <main className="az-legal">
      <p className="az-legal__page-title">Ajuda e Serviço de atendimento ao cliente</p>
      <div className="az-legal__layout">
        <PoliciesNav currentHref={doc.href} />

        <div className="az-legal__content">
          <LegalSearch />

          <nav className="az-legal__crumbs" aria-label="Trilha de navegação">
            <ol>
              {doc.crumbs.map((crumb) => (
                <li key={crumb}>
                  <Link href="/help">{crumb}</Link>
                </li>
              ))}
            </ol>
          </nav>

          <article className="az-legal__article" aria-labelledby="az-legal-title">
            <header className="az-legal__head">
              <h1 id="az-legal-title" className="az-legal__title">
                {doc.title}
              </h1>
              {doc.updatedAt && <p className="az-legal__updated">{doc.updatedAt}</p>}
            </header>
            {doc.intro.map((paragraph, index) => (
              <p key={index} className="az-legal__text">
                <Rich text={paragraph} />
              </p>
            ))}

            <nav className="az-legal__toc" aria-label="Nesta página">
              <ul>
                {doc.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ul>
            </nav>

            {doc.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="az-legal__section"
                aria-labelledby={`${section.id}-title`}
              >
                <h2 id={`${section.id}-title`} className="az-legal__section-title">
                  {section.title}
                </h2>
                {section.blocks.map((block, index) => (
                  <Block key={index} block={block} />
                ))}
              </section>
            ))}
          </article>
        </div>
      </div>
    </main>
  );
}
