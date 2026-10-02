import { CardBrand } from '@amazon-mvp/api-contract';

/**
 * Browser-only card number checks (CARD-001). The number never leaves this module's
 * callers: the API receives only the brand and the last four digits.
 */
export const cardDigits = (value: string) => value.replace(/\D/g, '').slice(0, 19);

/** Groups of four, or 4-6-5 for American Express. */
export function formatCardNumber(value: string): string {
  const digits = cardDigits(value);
  if (detectCardBrand(digits) === 'AMEX')
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      .filter(Boolean)
      .join(' ');
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** Brand from the number's prefix (simplified BIN ranges, enough for the simulation). */
export function detectCardBrand(value: string): CardBrand | null {
  const digits = cardDigits(value);
  if (/^(606282|3841)/.test(digits)) return 'HIPERCARD';
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(digits))
    return 'ELO';
  if (/^3[47]/.test(digits)) return 'AMEX';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD';
  if (/^4/.test(digits)) return 'VISA';
  return null;
}

export function passesLuhn(value: string): boolean {
  const digits = cardDigits(value);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return digits.length > 0 && sum % 10 === 0;
}

/** Error message for the number field, or '' when it is acceptable. */
export function cardNumberError(value: string): string {
  const digits = cardDigits(value);
  const brand = detectCardBrand(digits);
  if (!brand)
    return 'Bandeira não aceita. Use Visa, Mastercard, Elo, American Express ou Hipercard.';
  const length = brand === 'AMEX' ? [15] : [16, 19];
  if (!length.includes(digits.length) || !passesLuhn(digits)) return 'Número de cartão inválido.';
  return '';
}
