import Link from 'next/link';
import { Fragment, ReactNode } from 'react';
import { formatCartMoney } from '@/features/cart/money';
import { installmentPlan } from '@/features/product/product-rules';
import type { ContentBlock, RichText } from './customer-page-content';
import { CustomerIcon } from './customer-icons';

export type SlotContent = Partial<
  Record<Extract<ContentBlock, { kind: 'slot' }>['name'], ReactNode>
>;

export function Rich({ text }: { text: RichText }) {
  if (typeof text === 'string') return <>{text}</>;
  return (
    <>
      {text.map((part, index) =>
        typeof part === 'string' ? (
          <Fragment key={index}>{part}</Fragment>
        ) : (
          <Link key={index} href={part.href} className="az-cp__link">
            {part.text}
          </Link>
        ),
      )}
    </>
  );
}

/** Renders one typed content block. Everything is server-rendered; the FAQ uses
 * native <details>, so it is keyboard accessible without client JavaScript. */
export function Block({ block, slots }: { block: ContentBlock; slots: SlotContent }) {
  switch (block.kind) {
    case 'text':
      return (
        <>
          {block.paragraphs.map((paragraph, index) => (
            <p key={index} className="az-cp__text">
              <Rich text={paragraph} />
            </p>
          ))}
        </>
      );

    case 'list':
      return (
        <ul className="az-cp__list">
          {block.items.map((item, index) => (
            <li key={index}>
              <Rich text={item} />
            </li>
          ))}
        </ul>
      );

    case 'steps':
      return (
        <ol className="az-cp__steps">
          {block.items.map((step, index) => (
            <li key={step.title} className="az-cp__step">
              <span className="az-cp__step-number" aria-hidden="true">
                {index + 1}
              </span>
              <span className="az-cp__step-text">
                <strong className="az-cp__step-title">{step.title}</strong>
                <span className="az-cp__step-body">
                  <Rich text={step.body} />
                </span>
              </span>
            </li>
          ))}
        </ol>
      );

    case 'facts':
      return (
        <table className="az-cp__facts">
          <caption className="visually-hidden">{block.caption}</caption>
          <tbody>
            {block.items.map((item) => (
              <tr key={item.term}>
                <th scope="row">{item.term}</th>
                <td>
                  <Rich text={item.detail} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );

    case 'methods':
      return (
        <ul className="az-cp__methods">
          {block.items.map((method) => (
            <li key={method.title} className="az-cp__method">
              <span className="az-cp__method-icon">
                <CustomerIcon name={method.icon} size={32} />
              </span>
              <div className="az-cp__method-text">
                <h3 className="az-cp__method-title">{method.title}</h3>
                <p className="az-cp__method-label">
                  No checkout: <strong>{method.label}</strong>
                </p>
                <ul className="az-cp__list az-cp__list--compact">
                  {method.points.map((point, index) => (
                    <li key={index}>
                      <Rich text={point} />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      );

    case 'installments':
      return <InstallmentExample totalMinor={block.totalMinor} count={block.count} />;

    case 'links':
      return (
        <ul className="az-cp__cards">
          {block.items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="az-cp__card">
                <span className="az-cp__card-title">{item.title}</span>
                <span className="az-cp__card-body">{item.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      );

    case 'faq':
      return (
        <div className="az-cp__faq">
          {block.items.map((item) => (
            <details key={item.question} className="az-cp__faq-item">
              <summary className="az-cp__faq-question">
                <span>{item.question}</span>
                <Chevron />
              </summary>
              <div className="az-cp__faq-answer">
                {item.answer.map((paragraph, index) => (
                  <p key={index}>
                    <Rich text={paragraph} />
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      );

    case 'empty':
      return (
        <div className="az-cp__empty" role="status">
          <span className="az-cp__empty-icon">
            <CustomerIcon name="recalls" size={36} />
          </span>
          <div>
            <p className="az-cp__empty-title">{block.title}</p>
            <p className="az-cp__empty-body">{block.body}</p>
          </div>
        </div>
      );

    case 'slot':
      return <>{slots[block.name] ?? null}</>;
  }
}

/** Worked example using the product page's own installment rule. */
export function InstallmentExample({ totalMinor, count }: { totalMinor: number; count: number }) {
  const plan = installmentPlan(totalMinor, count);
  const money = (minor: number) => formatCartMoney(minor);
  return (
    <table className="az-cp__installments">
      <caption>
        Exemplo ilustrativo: {money(plan.totalMinor)} em {plan.count}x sem juros
      </caption>
      <tbody>
        <tr>
          <th scope="row">{plan.count > 2 ? `Parcelas 1 a ${plan.count - 1}` : 'Parcela 1'}</th>
          <td>{money(plan.eachMinor)} cada</td>
        </tr>
        <tr>
          <th scope="row">Parcela {plan.count}</th>
          <td>{money(plan.lastMinor)}</td>
        </tr>
        <tr className="az-cp__installments-total">
          <th scope="row">Total</th>
          <td>{money(plan.totalMinor)}</td>
        </tr>
      </tbody>
    </table>
  );
}

function Chevron() {
  return (
    <svg
      className="az-cp__faq-chevron"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
