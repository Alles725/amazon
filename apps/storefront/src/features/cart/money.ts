/** Division is display-only; all calculations and API amounts stay in cents. */
export function formatCartMoney(amountMinor: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amountMinor / 100);
}
