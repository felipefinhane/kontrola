import { and, eq } from "drizzle-orm";
import { withUserContext } from "@/db";
import { accounts, transactions, users } from "@/db/schema";
import { encryptField } from "@/lib/crypto";

// Every function here takes the caller's userId and goes through
// withUserContext — never plain `db` (src/db/index.ts's own doc comment:
// isolation belongs to Postgres via RLS, not to a WHERE clause every call
// site has to remember). No `.where(eq(accounts.userId, userId))` below
// either, for the same reason: schema.ts's accounts_owner_only /
// transactions_via_account_owner policies already scope every row to
// app.user_id — adding it here would be redundant, not extra-safe.

export async function getUserDefaultCurrency(userId: string) {
  return withUserContext(userId, async (tx) => {
    const [user] = await tx
      .select({ defaultCurrency: users.defaultCurrency })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user?.defaultCurrency ?? "BRL";
  });
}

export async function listAccounts(userId: string) {
  return withUserContext(userId, (tx) =>
    tx.select().from(accounts).orderBy(accounts.createdAt),
  );
}

export async function getAccount(userId: string, accountId: string) {
  return withUserContext(userId, async (tx) => {
    const [account] = await tx
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);
    return account ?? null;
  });
}

export type AccountWithBalance = typeof accounts.$inferSelect & {
  // CONTEXT.md: "Balance is always derived, never stored" — summed here
  // from `actual` Transactions, never read off a column.
  balance: number;
};

// Single-Account counterpart to listAccountsWithBalances below — #7
// Account Detail needs one Account's balance, not every Account's, so
// this scopes the Transaction sum by accountId instead of fetching (and
// then filtering out) every Account the user has.
export async function getAccountWithBalance(
  userId: string,
  accountId: string,
): Promise<AccountWithBalance | null> {
  return withUserContext(userId, async (tx) => {
    const [account] = await tx
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);
    if (!account) return null;

    const txRows = await tx
      .select({ amount: transactions.amount, direction: transactions.direction })
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accountId),
          eq(transactions.status, "actual"),
        ),
      );

    const balance = txRows.reduce(
      (sum, t) =>
        sum + (t.direction === "credit" ? Number(t.amount) : -Number(t.amount)),
      0,
    );

    return { ...account, balance };
  });
}

export async function listAccountsWithBalances(
  userId: string,
): Promise<AccountWithBalance[]> {
  return withUserContext(userId, async (tx) => {
    const accountRows = await tx
      .select()
      .from(accounts)
      .orderBy(accounts.createdAt);
    if (accountRows.length === 0) return [];

    // One query for every actual Transaction across all of this user's
    // Accounts (RLS scopes it, same as everything else here), summed in
    // JS rather than a SQL CASE/SUM — simpler to read and plenty fast at
    // personal-finance transaction volumes (ADR-0003's same call for
    // field encryption).
    const txRows = await tx
      .select({
        accountId: transactions.accountId,
        amount: transactions.amount,
        direction: transactions.direction,
      })
      .from(transactions)
      .where(eq(transactions.status, "actual"));

    const balanceByAccount = new Map<string, number>();
    for (const t of txRows) {
      const signed = t.direction === "credit" ? Number(t.amount) : -Number(t.amount);
      balanceByAccount.set(
        t.accountId,
        (balanceByAccount.get(t.accountId) ?? 0) + signed,
      );
    }

    return accountRows.map((account) => ({
      ...account,
      balance: balanceByAccount.get(account.id) ?? 0,
    }));
  });
}

export type NewAccountInput = {
  nickname: string;
  bankName: string | null;
  currency: string;
  // >= 0, in the account's currency. 0/omitted means "start empty" — see
  // createAccount for why that skips the seed Transaction entirely
  // rather than inserting a zero-amount row.
  openingBalance: number;
  // Pre-translated by the caller (a Server Action has no React tree to
  // pull useTranslations from) — see src/app/accounts/new/actions.ts.
  openingBalanceDescription: string;
};

export async function createAccount(userId: string, input: NewAccountInput) {
  return withUserContext(userId, async (tx) => {
    const [account] = await tx
      .insert(accounts)
      .values({
        userId,
        nickname: input.nickname,
        bankName: input.bankName,
        currency: input.currency,
      })
      .returning();

    // CONTEXT.md: "Balance is always derived, never stored." An opening
    // balance isn't a special field on the Account row — it's just the
    // account's first `actual` Transaction, exactly like every other one
    // Balance gets summed from. Direction is always `credit`: this
    // screen only models "fund the account with a starting amount," not
    // an opening debt — see docs/stitch-export/09-add-account.html,
    // which has no debit/credit toggle, just a plain amount.
    if (input.openingBalance > 0) {
      await tx.insert(transactions).values({
        accountId: account.id,
        description: encryptField(input.openingBalanceDescription),
        amount: input.openingBalance.toFixed(2),
        direction: "credit",
        status: "actual",
        occurredOn: new Date().toISOString().slice(0, 10),
      });
    }

    return account;
  });
}
