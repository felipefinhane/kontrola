import { and, asc, desc, eq } from "drizzle-orm";
import { withUserContext } from "@/db";
import { accounts, categories, transactions } from "@/db/schema";
import { encryptField, decryptField } from "@/lib/crypto";

// Same discipline as accounts.ts/categories.ts: always withUserContext,
// never a manual `.where(userId)` — schema.ts's transactions_via_account_owner
// policy (an EXISTS against accounts.user_id) already scopes every row.
// No extra check on categoryId's ownership either: the account picker in
// the UI only ever offers this user's own accounts/categories, and RLS on
// `categories` itself still stops anyone from ever reading another user's
// custom category row, whatever gets tagged onto a transaction.

export type TransactionInput = {
  accountId: string;
  categoryId: string | null;
  description: string;
  amount: number; // > 0, direction carries the sign
  direction: "credit" | "debit";
  occurredOn: string; // YYYY-MM-DD
  // Defaults to "actual" — #9's own Add/Edit form never sets this
  // (matches the mockup, no status control there). #11 Planned view's
  // "Add Planned" entry point is the only caller that passes "planned",
  // via a query param, not a form toggle.
  status?: "actual" | "planned";
};

export type TransactionWithDetails = {
  id: string;
  accountId: string;
  accountNickname: string;
  categoryId: string | null;
  description: string;
  note: string | null;
  amount: number;
  direction: "credit" | "debit";
  status: "planned" | "actual";
  occurredOn: string;
  currency: string; // from the joined Account — Transaction itself carries no Currency
  categoryName: string | null;
  categoryIcon: string | null;
};

// `note` isn't collected by #9's Add/Edit Transaction screen at all —
// schema.ts's own comment on that column says it's "the 'Note (Optional)'
// field on Confirm Recurring" (a RecurringTemplate/v1.1 screen, not built
// yet), not this one. Every Transaction #9 creates has note: null.
const SELECT_COLUMNS = {
  id: transactions.id,
  accountId: transactions.accountId,
  accountNickname: accounts.nickname,
  categoryId: transactions.categoryId,
  description: transactions.description,
  note: transactions.note,
  amount: transactions.amount,
  direction: transactions.direction,
  status: transactions.status,
  occurredOn: transactions.occurredOn,
  currency: accounts.currency,
  categoryName: categories.name,
  categoryIcon: categories.icon,
};

type RawRow = {
  id: string;
  accountId: string;
  accountNickname: string;
  categoryId: string | null;
  description: string;
  note: string | null;
  amount: string;
  direction: string;
  status: string;
  occurredOn: string;
  currency: string;
  categoryName: string | null;
  categoryIcon: string | null;
};

function toTransactionWithDetails(row: RawRow): TransactionWithDetails {
  return {
    id: row.id,
    accountId: row.accountId,
    accountNickname: row.accountNickname,
    categoryId: row.categoryId,
    description: decryptField(row.description),
    note: row.note ? decryptField(row.note) : null,
    amount: Number(row.amount),
    direction: row.direction as "credit" | "debit",
    status: row.status as "planned" | "actual",
    occurredOn: row.occurredOn,
    currency: row.currency,
    categoryName: row.categoryName,
    categoryIcon: row.categoryIcon,
  };
}

export async function createTransaction(
  userId: string,
  input: TransactionInput,
) {
  return withUserContext(userId, async (tx) => {
    const [transaction] = await tx
      .insert(transactions)
      .values({
        accountId: input.accountId,
        categoryId: input.categoryId,
        description: encryptField(input.description),
        amount: input.amount.toFixed(2),
        direction: input.direction,
        status: input.status ?? "actual",
        occurredOn: input.occurredOn,
      })
      .returning();
    return transaction;
  });
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: TransactionInput,
) {
  return withUserContext(userId, async (tx) => {
    const [transaction] = await tx
      .update(transactions)
      .set({
        accountId: input.accountId,
        categoryId: input.categoryId,
        description: encryptField(input.description),
        amount: input.amount.toFixed(2),
        direction: input.direction,
        occurredOn: input.occurredOn,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId))
      .returning();
    return transaction ?? null;
  });
}

// CONTEXT.md: "A `planned` Transaction becomes `actual` in place (same
// row, status flips) when confirmed." Only ever flips planned -> actual
// (the extra status check in `where` makes double-confirming a no-op
// rather than an error) — there's no UI path back the other way.
export async function confirmTransaction(userId: string, transactionId: string) {
  return withUserContext(userId, async (tx) => {
    const [transaction] = await tx
      .update(transactions)
      .set({ status: "actual", updatedAt: new Date() })
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.status, "planned"),
        ),
      )
      .returning();
    return transaction ?? null;
  });
}

export async function getTransaction(
  userId: string,
  transactionId: string,
): Promise<TransactionWithDetails | null> {
  return withUserContext(userId, async (tx) => {
    const [row] = await tx
      .select(SELECT_COLUMNS)
      .from(transactions)
      .innerJoin(accounts, eq(accounts.id, transactions.accountId))
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .where(eq(transactions.id, transactionId))
      .limit(1);
    return row ? toTransactionWithDetails(row) : null;
  });
}

export type TransactionFilters = {
  accountId?: string;
  categoryId?: string;
  status?: "actual" | "planned";
  limit?: number;
  // occurredOn order: "desc" (default) = most recent first, for #10's
  // history and #12's dashboard; "asc" = soonest first, for #11's
  // forward-looking Planned view.
  order?: "asc" | "desc";
};

// General-purpose list across every Account the user has — #10's History,
// #11's Planned view, and #12's dashboard "Recent Transactions" are all
// this with different filters, rather than three near-duplicate queries.
export async function listTransactions(
  userId: string,
  filters: TransactionFilters = {},
): Promise<TransactionWithDetails[]> {
  return withUserContext(userId, async (tx) => {
    const conditions = [];
    if (filters.accountId) {
      conditions.push(eq(transactions.accountId, filters.accountId));
    }
    if (filters.categoryId) {
      conditions.push(eq(transactions.categoryId, filters.categoryId));
    }
    if (filters.status) {
      conditions.push(eq(transactions.status, filters.status));
    }

    const orderFn = filters.order === "asc" ? asc : desc;

    const base = tx
      .select(SELECT_COLUMNS)
      .from(transactions)
      .innerJoin(accounts, eq(accounts.id, transactions.accountId))
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderFn(transactions.occurredOn), orderFn(transactions.createdAt));

    const rows = filters.limit ? await base.limit(filters.limit) : await base;
    return rows.map(toTransactionWithDetails);
  });
}

export async function getAccountTransactions(
  userId: string,
  accountId: string,
): Promise<TransactionWithDetails[]> {
  return listTransactions(userId, { accountId });
}
