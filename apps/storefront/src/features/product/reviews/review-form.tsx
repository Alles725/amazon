'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import {
  isApiErrorBody,
  REVIEW_LIMITS,
  REVIEW_ROUTES,
  type SaveReviewRequest,
} from '@amazon-mvp/api-contract';

const RATING_WORDS = ['Odiei', 'Não gostei', 'Razoável', 'Gostei', 'Adorei'];

type Field = 'rating' | 'title' | 'body';
type Errors = Partial<Record<Field, string>>;

export function validateReview(input: { rating: number; title: string; body: string }): Errors {
  const errors: Errors = {};
  const title = input.title.trim();
  const body = input.body.trim();
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)
    errors.rating = 'Selecione uma classificação por estrelas.';
  if (title.length < REVIEW_LIMITS.titleMin)
    errors.title = `Escreva um título com pelo menos ${REVIEW_LIMITS.titleMin} caracteres.`;
  else if (title.length > REVIEW_LIMITS.titleMax)
    errors.title = `O título pode ter até ${REVIEW_LIMITS.titleMax} caracteres.`;
  if (body.length < REVIEW_LIMITS.bodyMin)
    errors.body = `Escreva uma avaliação com pelo menos ${REVIEW_LIMITS.bodyMin} caracteres.`;
  else if (body.length > REVIEW_LIMITS.bodyMax)
    errors.body = `A avaliação pode ter até ${REVIEW_LIMITS.bodyMax.toLocaleString('pt-BR')} caracteres.`;
  return errors;
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
      <path
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
        fill={filled ? '#ffa41c' : '#fff'}
        stroke={filled ? '#de7921' : '#8d9096'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Creates or edits the signed-in customer's review (PUT /reviews/mine). The star
 * picker is a native radio group, so arrow keys, Home/End and screen readers work
 * without custom key handling. Validation mirrors the API's REVIEW_LIMITS; the API
 * stays authoritative.
 */
export function ReviewForm({
  productId,
  productHref,
  loginHref,
  initial,
}: {
  productId: string;
  /** /products/<slug>, where the customer lands after saving. */
  productHref: string;
  loginHref: string;
  initial?: { rating: number; title: string; body: string };
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [pending, setPending] = useState(false);
  const refs = {
    rating: useRef<HTMLInputElement>(null),
    title: useRef<HTMLInputElement>(null),
    body: useRef<HTMLTextAreaElement>(null),
  };
  const shown = hovered || rating;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateReview({ rating, title, body });
    setErrors(found);
    setSubmitError('');
    const first = (['rating', 'title', 'body'] as const).find((field) => found[field]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    setPending(true);
    try {
      const request: SaveReviewRequest = {
        productId,
        rating,
        title: title.trim(),
        body: body.trim(),
      };
      const response = await fetch(REVIEW_ROUTES.mine, {
        method: 'PUT',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (response.status === 401) {
        router.push(loginHref);
        return;
      }
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        setSubmitError(
          response.status === 400
            ? 'Revise os campos da avaliação e tente novamente.'
            : isApiErrorBody(payload) && response.status === 404
              ? 'Este produto não está mais disponível para avaliação.'
              : 'Não foi possível enviar sua avaliação. Tente novamente.',
        );
        setPending(false);
        return;
      }
      router.push(`${productHref}?review=${initial ? 'updated' : 'published'}#customer-reviews`);
      router.refresh();
    } catch {
      setSubmitError('Não foi possível enviar sua avaliação. Tente novamente.');
      setPending(false);
    }
  };

  const describedBy = (field: Field, hint?: string) =>
    [hint, errors[field] ? `review-${field}-error` : undefined].filter(Boolean).join(' ') ||
    undefined;

  return (
    <form className="az-review-form" onSubmit={(event) => void submit(event)} noValidate>
      <fieldset
        className="az-review-form__group"
        aria-describedby={describedBy('rating')}
        aria-invalid={errors.rating ? true : undefined}
      >
        <legend>Classificação geral</legend>
        <div className="az-review-stars" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <span key={value} className="az-review-stars__option">
              <input
                ref={value === (rating || 1) ? refs.rating : undefined}
                type="radio"
                id={`review-rating-${value}`}
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="az-review-stars__input"
              />
              <label
                htmlFor={`review-rating-${value}`}
                onMouseEnter={() => setHovered(value)}
                title={RATING_WORDS[value - 1]}
              >
                <Star filled={value <= shown} />
                <span className="visually-hidden">
                  {value} {value === 1 ? 'estrela' : 'estrelas'}: {RATING_WORDS[value - 1]}
                </span>
              </label>
            </span>
          ))}
          <span className="az-review-stars__word" aria-hidden="true">
            {shown ? RATING_WORDS[shown - 1] : ''}
          </span>
        </div>
        {errors.rating && (
          <p className="az-review-error" id="review-rating-error">
            {errors.rating}
          </p>
        )}
      </fieldset>

      <div className="az-review-form__group">
        <label htmlFor="review-title" className="az-review-form__label">
          Adicione um título
        </label>
        <input
          ref={refs.title}
          id="review-title"
          name="title"
          type="text"
          value={title}
          maxLength={REVIEW_LIMITS.titleMax}
          placeholder="O que é mais importante saber?"
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={describedBy('title')}
          className="az-review-form__input"
        />
        {errors.title && (
          <p className="az-review-error" id="review-title-error">
            {errors.title}
          </p>
        )}
      </div>

      <div className="az-review-form__group">
        <label htmlFor="review-body" className="az-review-form__label">
          Adicione uma avaliação escrita
        </label>
        <textarea
          ref={refs.body}
          id="review-body"
          name="body"
          rows={7}
          value={body}
          maxLength={REVIEW_LIMITS.bodyMax}
          placeholder="Do que você gostou ou não gostou? Como você usou este produto?"
          onChange={(event) => setBody(event.target.value)}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={describedBy('body', 'review-body-count')}
          className="az-review-form__input"
        />
        <p className="az-review-form__hint" id="review-body-count">
          {body.trim().length.toLocaleString('pt-BR')} de{' '}
          {REVIEW_LIMITS.bodyMax.toLocaleString('pt-BR')} caracteres (mínimo {REVIEW_LIMITS.bodyMin})
        </p>
        {errors.body && (
          <p className="az-review-error" id="review-body-error">
            {errors.body}
          </p>
        )}
      </div>

      {submitError && (
        <p className="az-review-error" role="alert">
          {submitError}
        </p>
      )}
      <div className="az-review-form__actions">
        <button type="submit" className="az-review-form__submit" disabled={pending}>
          {pending ? 'Enviando…' : initial ? 'Salvar alterações' : 'Enviar'}
        </button>
      </div>
    </form>
  );
}
