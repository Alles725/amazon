'use client';
import { useRouter } from 'next/navigation';
import type { CatalogSort } from '@amazon-mvp/api-contract';

/** "Classificar por": navigates as soon as an option is picked. Without JavaScript it is
 * a plain GET form (hidden fields keep the current filters) with an "Aplicar" button. */
export function SortSelect({
  value,
  options,
  hidden,
}: {
  value: CatalogSort;
  options: Array<{ value: CatalogSort; label: string; href: string }>;
  hidden: Array<[name: string, value: string]>;
}) {
  const router = useRouter();
  return (
    <form action="/products" method="get" className="az-browse-sort">
      {hidden.map(([name, fieldValue]) => (
        <input key={name} type="hidden" name={name} value={fieldValue} />
      ))}
      <label htmlFor="az-browse-sort">Classificar por:</label>
      <select
        id="az-browse-sort"
        name="sort"
        defaultValue={value}
        onChange={(event) => {
          const option = options.find((item) => item.value === event.currentTarget.value);
          if (option) router.push(option.href);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit">Aplicar</button>
      </noscript>
    </form>
  );
}
