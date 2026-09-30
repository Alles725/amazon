import { percentDiscountMinor } from '@amazon-mvp/api-contract';
import { formatCartMoney } from '@/features/cart/money';
import './pix-price.css';

/**
 * "R$ X no Pix (5% de desconto)". The rate comes from the API (GET /orders/pricing)
 * and the amount uses the same rounding rule as the checkout quote
 * (percentDiscountMinor), so what is advertised here is what checkout charges for
 * this amount. Renders nothing when there is no rate or the discount rounds to zero.
 */
export function PixPrice({
  amountMinor,
  currency,
  percent,
  prefix,
  className = '',
}: {
  amountMinor: number;
  currency: string;
  percent: number | null | undefined;
  /** Leading text such as "ou ". */
  prefix?: string;
  className?: string;
}) {
  if (!percent) return null;
  const discount = percentDiscountMinor(amountMinor, percent);
  if (discount <= 0) return null;
  return (
    <p className={`az-pix-price ${className}`.trim()}>
      {prefix}
      <strong>{formatCartMoney(amountMinor - discount, currency)}</strong> no Pix{' '}
      <span className="az-pix-price__rate">({percent}% de desconto)</span>
    </p>
  );
}
