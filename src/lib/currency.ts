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
