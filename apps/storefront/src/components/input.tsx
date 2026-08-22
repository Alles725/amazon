import { InputHTMLAttributes, useId } from 'react';

export function Input({
  label,
  hint,
  error,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const generated = useId();
  const inputId = id ?? generated;
  const describedBy = [hint && `${inputId}-hint`, error && `${inputId}-error`]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="field__input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {hint && (
        <p className="field__hint" id={`${inputId}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
