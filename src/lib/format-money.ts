// Locale-aware currency formatting via Intl — no manual symbol/decimal
// tables to maintain, and it's already correct for the two locales this
// app ships (src/i18n/request.ts: en, pt-BR).

export function formatMoney(
  amount: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amount,
  );
}

// Splits a formatted amount into its whole and fractional parts — the
// Total Balance hero card (docs/stitch-export/07-accounts-list.html)
// renders the integer part large and the cents smaller. Uses
// formatToParts rather than a naive string split on "," or "." since
// which character means what flips between locales (1.234,56 in pt-BR
// vs 1,234.56 in en).
export function formatMoneyParts(
  amount: number,
  currency: string,
  locale: string,
): { whole: string; fraction: string } {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).formatToParts(amount);

  const decimalIndex = parts.findIndex((p) => p.type === "decimal");
  if (decimalIndex === -1) {
    return { whole: parts.map((p) => p.value).join(""), fraction: "" };
  }

  return {
    whole: parts
      .slice(0, decimalIndex)
      .map((p) => p.value)
      .join(""),
    // Includes the decimal separator itself (",77" / ".77").
    fraction: parts
      .slice(decimalIndex)
      .map((p) => p.value)
      .join(""),
  };
}
