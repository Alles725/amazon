import Link from 'next/link';
import { Block, Rich, SlotContent } from './customer-blocks';
import {
  CUSTOMER_PAGES,
  CUSTOMER_PAGE_ORDER,
  CustomerPage,
  GROUP_LABELS,
} from './customer-page-content';
import { CustomerIcon } from './customer-icons';

const GROUPS = Object.keys(GROUP_LABELS) as CustomerPage['group'][];

/** Help-article body shared by the footer help/payment pages: breadcrumb,
 * article (title, notice, sections, related topics) and the topics sidebar. */
export function CustomerArticle({ page, slots = {} }: { page: CustomerPage; slots?: SlotContent }) {
  return (
    <main className="az-cp">
      <div className="az-cp__inner">
        <nav className="az-cp__crumbs" aria-label="Trilha de navegação">
          <ol>
            <li>
              <Link href="/help">Atendimento ao Cliente</Link>
            </li>
            <li>{page.category}</li>
            <li aria-current="page">{page.title}</li>
          </ol>
        </nav>

        <div className="az-cp__layout">
          <article className="az-cp__article" aria-labelledby="az-cp-title">
            <header className="az-cp__head">
              <span className="az-cp__head-icon">
                <CustomerIcon name={page.icon} />
              </span>
              <div>
                <h1 id="az-cp-title" className="az-cp__title">
                  {page.title}
                </h1>
                <p className="az-cp__lead">{page.lead}</p>
              </div>
            </header>

            {page.notice && (
              <div
                className={`az-cp__notice az-cp__notice--${page.notice.tone}`}
                role="note"
                aria-label={page.notice.title}
              >
                <span className="az-cp__notice-icon" aria-hidden="true">
                  {page.notice.tone === 'warning' ? '!' : 'i'}
                </span>
                <div>
                  <p className="az-cp__notice-title">{page.notice.title}</p>
                  <p className="az-cp__notice-body">
                    <Rich text={page.notice.body} />
                  </p>
                </div>
              </div>
            )}

            <nav className="az-cp__toc" aria-label="Nesta página">
              <p className="az-cp__toc-title" aria-hidden="true">
                Nesta página
              </p>
              <ul>
                {page.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ul>
            </nav>

            {page.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="az-cp__section"
                aria-labelledby={`${section.id}-title`}
              >
                <h2 id={`${section.id}-title`} className="az-cp__section-title">
                  {section.title}
                </h2>
                {section.blocks.map((block, index) => (
                  <Block key={index} block={block} slots={slots} />
                ))}
              </section>
            ))}

            {page.related.length > 0 && (
              <section className="az-cp__section" aria-labelledby="az-cp-related">
                <h2 id="az-cp-related" className="az-cp__section-title">
                  Tópicos relacionados
                </h2>
                <ul className="az-cp__cards">
                  {page.related.map((key) => {
                    const related = CUSTOMER_PAGES[key];
                    return (
                      <li key={key}>
                        <Link href={related.href} className="az-cp__card az-cp__card--icon">
                          <span className="az-cp__card-icon">
                            <CustomerIcon name={related.icon} size={28} />
                          </span>
                          <span className="az-cp__card-text">
                            <span className="az-cp__card-title">{related.title}</span>
                            <span className="az-cp__card-body">{related.summary}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </article>

          <aside className="az-cp__aside" aria-labelledby="az-cp-aside-title">
            <h2 id="az-cp-aside-title" className="az-cp__aside-title">
              Mais tópicos de ajuda
            </h2>
            {GROUPS.map((group) => (
              <div key={group} className="az-cp__aside-group">
                <h3 className="az-cp__aside-heading">{GROUP_LABELS[group]}</h3>
                <ul>
                  {CUSTOMER_PAGE_ORDER.map((key) => CUSTOMER_PAGES[key])
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          className="az-cp__aside-link"
                          aria-current={item.key === page.key ? 'page' : undefined}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <Link href="/help" className="az-cp__aside-all">
              Todos os tópicos de ajuda <span aria-hidden="true">›</span>
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
