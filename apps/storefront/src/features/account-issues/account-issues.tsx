'use client';

import { Fragment, type ReactNode, useId, useState } from 'react';
import Link from 'next/link';
import { ACCOUNT_ISSUES, type IssueBlock, type IssueText } from './account-issues-content';

function Rich({ text }: { text: IssueText }) {
  if (typeof text === 'string') return <>{text}</>;
  return (
    <>
      {text.map((part, index) =>
        typeof part === 'string' ? (
          <Fragment key={index}>{part}</Fragment>
        ) : (
          <Link key={index} href={part.href} className="az-issues__link">
            {part.text}
          </Link>
        ),
      )}
    </>
  );
}

function Block({ block }: { block: IssueBlock }) {
  if (block.kind === 'steps') {
    return (
      <ol className="az-issues__steps">
        {block.items.map((item, index) => (
          <li key={index}>
            <Rich text={item} />
          </li>
        ))}
      </ol>
    );
  }
  return (
    <p>
      <Rich text={block.body} />
    </p>
  );
}

/** Numbered step box, as in Amazon's "Problemas na conta e de login" wizard. */
function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section className="az-issues__step" aria-labelledby={headingId}>
      <header className="az-issues__step-header">
        <span className="az-issues__step-number" aria-hidden="true">
          {number}
        </span>
        <h2 className="az-issues__step-title" id={headingId}>
          {title}
        </h2>
      </header>
      <div className="az-issues__step-body">{children}</div>
    </section>
  );
}

/** "Selecione um problema" picker; each option reveals its "Você sabia?" answer. */
export function AccountIssues() {
  const [selectedId, setSelectedId] = useState('');
  const selected = ACCOUNT_ISSUES.find((issue) => issue.id === selectedId);

  return (
    <main className="az-issues">
      <h1 className="az-issues__title">Problemas na conta e de login</h1>

      <Step number={1} title="Em que podemos ajudar?">
        <div className="az-issues__field">
          <label className="az-issues__label" htmlFor="account-issue">
            Selecione um problema
          </label>
          <select
            id="account-issue"
            className="az-issues__select"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            <option value="">&lt; Selecione &gt;</option>
            {ACCOUNT_ISSUES.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.label}
              </option>
            ))}
          </select>
        </div>
      </Step>

      {selected && (
        <Step number={2} title="Você sabia?">
          <div className="az-issues__answer" aria-live="polite">
            {selected.blocks.map((block, index) => (
              <Block key={index} block={block} />
            ))}
          </div>
        </Step>
      )}
    </main>
  );
}
