import { and, asc, desc, eq, gte } from "drizzle-orm";
import { withUserContext } from "@/db";
import { accounts, categories, transactions } from "@/db/schema";

// Same discipline as src/db/queries/accounts.ts: always withUserContext,
// never a manual `.where(userId)` — schema.ts's categories_own_or_system
// policy (`userId = currentUserId OR userId IS NULL`) already returns
// exactly "system defaults + this user's own," nothing more to filter.

export async function listCategories(userId: string) {
  return withUserContext(userId, (tx) =>
    tx
      .select()
      .from(categories)
      // Defaults grouped first (alphabetical among themselves), then the
      // user's own custom ones (also alphabetical) — stable regardless of
      // insert order, unlike sorting by createdAt.
      .orderBy(desc(categories.isSystemDefault), asc(categories.name)),
  );
}

export async function createCategory(userId: string, name: string) {
  return withUserContext(userId, async (tx) => {
    const [category] = await tx
      .insert(categories)
      .values({ userId, name, isSystemDefault: false })
      .returning();
    return category;
  });
}

export type CategorySpend = {
  // null groups every uncategorized debit — still real spend (must count
  // toward a page's overall Total Spend), just with no category tile of
  // its own to land on (no "Uncategorized" tile is designed here). A
  // caller building a per-category breakdown must skip null entries
  // itself; a caller computing a grand total must not.
  categoryId: string | null;
  currency: string;
  total: number;
};

export async function getCategorySpendThisMonth(
  userId: string,
): Promise<CategorySpend[]> {
  return withUserContext(userId, async (tx) => {
    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    )
      .toISOString()
      .slice(0, 10);

    // "Spend" means debits only — a credit (income, a transfer in) isn't
    // spend even if it's tagged with a Category. Joins accounts for its
    // currency: an amount is only ever meaningful next to the Currency it
    // was moved in (ADR-0007), Transaction itself doesn't carry one.
    const rows = await tx
      .select({
        categoryId: transactions.categoryId,
        currency: accounts.currency,
        amount: transactions.amount,
      })
      .from(transactions)
      .innerJoin(accounts, eq(accounts.id, transactions.accountId))
      .where(
        and(
          eq(transactions.status, "actual"),
          eq(transactions.direction, "debit"),
          gte(transactions.occurredOn, startOfMonth),
        ),
      );

    const totals = new Map<string, number>();
    for (const row of rows) {
      const key = `${row.categoryId ?? ""} ${row.currency}`;
      totals.set(key, (totals.get(key) ?? 0) + Number(row.amount));
    }

    return [...totals.entries()].map(([key, total]) => {
      const [categoryId, currency] = key.split(" ");
      return { categoryId: categoryId || null, currency, total };
    });
  });
}
