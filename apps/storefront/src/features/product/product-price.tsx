import { formatCartMoney } from '@/features/cart/money';

export function ProductPrice({ amount, currency }: { amount: number; currency: string }) {
  const parts = new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).formatToParts(
    amount / 100,
  );
  return (
    <span className="az-pdp-price" aria-label={formatCartMoney(amount, currency)}>
      <span className="az-pdp-price__currency" aria-hidden="true">
        {parts.find((p) => p.type === 'currency')?.value}
      </span>
      <span aria-hidden="true">
        {parts
          .filter((p) => p.type === 'integer' || p.type === 'group')
          .map((p) => p.value)
          .join('')}
      </span>
      <span className="az-pdp-price__fraction" aria-hidden="true">
        {parts.find((p) => p.type === 'fraction')?.value}
      </span>
    </span>
  );
}
