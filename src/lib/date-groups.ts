// Groups a list of dated things (Transactions today, in #7 and later #10)
// into "Today" / "Yesterday" / everything else, the treatment every
// Stitch export with a transaction list uses. Returns a group *key*, not
// a translated label — the caller owns i18n (via useTranslations/
// getTranslations) and its own date formatting for the "older" case.

export type DateGroupKey = "today" | "yesterday" | string; // string = the occurredOn value itself

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getDateGroupKey(occurredOn: string): DateGroupKey {
  const now = new Date();
  const today = toDateOnly(now);
  const yesterday = toDateOnly(new Date(now.getTime() - 24 * 60 * 60 * 1000));

  if (occurredOn === today) return "today";
  if (occurredOn === yesterday) return "yesterday";
  return occurredOn;
}

// Groups an already-sorted (descending by date) list into ordered
// [key, items[]] buckets, preserving input order within and across
// groups — callers must sort before calling this.
export function groupByDate<T>(
  items: T[],
  getOccurredOn: (item: T) => string,
): { key: DateGroupKey; items: T[] }[] {
  const groups: { key: DateGroupKey; items: T[] }[] = [];
  for (const item of items) {
    const key = getDateGroupKey(getOccurredOn(item));
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.key === key) {
      lastGroup.items.push(item);
    } else {
      groups.push({ key, items: [item] });
    }
  }
  return groups;
}
