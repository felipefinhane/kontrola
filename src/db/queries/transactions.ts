import { desc, eq } from "drizzle-orm";
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
};

export type TransactionWithDetails = {
  id: string;
  accountId: string;
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
        status: "actual", // #11 owns the "let a User create a planned Transaction directly" decision — out of scope here
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

export async function getAccountTransactions(
  userId: string,
  accountId: string,
): Promise<TransactionWithDetails[]> {
  return withUserContext(userId, async (tx) => {
    const rows = await tx
      .select(SELECT_COLUMNS)
      .from(transactions)
      .innerJoin(accounts, eq(accounts.id, transactions.accountId))
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.occurredOn), desc(transactions.createdAt));
    return rows.map(toTransactionWithDetails);
  });
}
