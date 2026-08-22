import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'quiet';

export function Button({
  variant = 'primary',
  block = false,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      className={`button button--${variant}${block ? ' button--block' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
