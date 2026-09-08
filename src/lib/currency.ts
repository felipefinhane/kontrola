// The 3-currency picker from docs/stitch-export/09-add-account.html.
// Not an exhaustive ISO 4217 list — CONTEXT.md/ADR-0007: today's data is
// 100% BRL, multi-currency is supported but not yet real, so this stays
// deliberately small rather than a full currency-code dropdown. Extend
// here if a real need for another currency shows up.
export const SUPPORTED_CURRENCIES = [
  { code: "BRL", symbol: "R$" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export function isSupportedCurrency(value: string): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.some((c) => c.code === value);
}

// ADR-0007: "the aggregate balance view groups totals by Currency ...
// rather than converting everything into one blended number." Applies
// beyond just Account balances (#6) — #8's "Total Spend This Month" is
// the same rule over Transaction amounts instead, so this stays generic
// rather than accounts-shaped. Order follows first appearance in the
// input (itself usually createdAt-order upstream), not a fixed currency
// ranking — there's no "primary" currency concept.
export function groupAmountsByCurrency(
  items: { currency: string; amount: number }[],
): { currency: string; total: number }[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.currency, (totals.get(item.currency) ?? 0) + item.amount);
  }
  return [...totals.entries()].map(([currency, total]) => ({
    currency,
    total,
  }));
}
