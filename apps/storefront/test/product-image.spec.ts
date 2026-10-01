// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ProductImage } from '../src/components/amazon/product-image';
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => createElement('img', props),
}));
afterEach(cleanup);
it('replaces a failed photo with a safe fallback and tries a different source', () => {
  const view = render(
    createElement(ProductImage, { image: { src: '/one.jpg', alt: 'Produto um' }, glyph: 'camera' }),
  );
  fireEvent.error(screen.getByAltText('Produto um'));
  expect(screen.queryByAltText('Produto um')).toBeNull();
  expect(screen.getByRole('img', { name: 'Imagem do produto indisponível' })).toBeTruthy();
  view.rerender(createElement(ProductImage, { image: { src: '/two.jpg', alt: 'Produto dois' } }));
  expect(screen.getByAltText('Produto dois').getAttribute('src')).toBe('/two.jpg');
  expect(screen.queryByText('Imagem indisponível')).toBeNull();
});
