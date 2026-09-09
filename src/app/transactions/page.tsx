import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { listAccounts } from "@/db/queries/accounts";
import { listCategories } from "@/db/queries/categories";
import { listTransactions } from "@/db/queries/transactions";
import { formatMoney } from "@/lib/format-money";
import { getCategoryIcon } from "@/lib/category-icons";
import { groupByDate } from "@/lib/date-groups";
import { PlusIcon, CheckIcon } from "@/components/icons";
import { BottomNav } from "@/components/bottom-nav";
import { TransactionFilters } from "./transaction-filters";
import { confirmTransactionAction } from "./actions";

// Real Transactions List / History screen (docs/stitch-export/
// 06-transactions-list.html). "All Filters" chip (which opens a full
// filter sheet in the mockup — no such sheet/modal exists anywhere in
// this codebase) collapses into the same 3 filter selects the other
// chips already were, URL-driven (see transaction-filters.tsx) so a
// filtered view is a real, shareable/refreshable URL.
export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    accountId?: string;
    categoryId?: string;
    status?: string;
  }>;
}) {
  const { accountId, categoryId, status } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [accounts, categories, items, locale, t] = await Promise.all([
    listAccounts(session.user.id),
    listCategories(session.user.id),
    listTransactions(session.user.id, {
      accountId: accountId || undefined,
      categoryId: categoryId || undefined,
      status: status === "actual" || status === "planned" ? status : undefined,
    }),
    getLocale(),
    getTranslations("Transactions"),
  ]);

  const dateGroups = groupByDate(items, (item) => item.occurredOn);

  return (
    <main className="safe-top flex min-h-screen flex-col bg-background pb-28 text-foreground">
      <header className="sticky top-0 z-10 bg-background px-4 pt-4">
        <h1 className="mb-3 text-2xl font-bold text-primary">{t("title")}</h1>
        <TransactionFilters accounts={accounts} categories={categories} />
      </header>

      <div className="flex flex-col gap-6 px-4 py-2">
        {dateGroups.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            {t("noTransactions")}
          </p>
        ) : (
          dateGroups.map(({ key, items: rows }) => (
            <div key={key} className="flex flex-col gap-2">
              <h4 className="pl-1 text-xs font-medium uppercase tracking-wider text-muted">
                {key === "today" || key === "yesterday"
                  ? t(key)
                  : new Intl.DateTimeFormat(locale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(`${key}T00:00:00`))}
              </h4>
              <div className="flex flex-col gap-2">
                {rows.map((item) => {
                  const Icon = getCategoryIcon(item.categoryIcon);
                  const isPlanned = item.status === "planned";
                  return (
                    <div
                      key={item.id}
                      className={
                        isPlanned
                          ? "flex items-center gap-2 rounded-xl border-[1.5px] border-dashed border-planned bg-background p-4"
                          : "flex items-center gap-2 rounded-xl bg-surface p-4 shadow-sm"
                      }
                    >
                      <Link
                        href={`/transactions/${item.id}/edit`}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <span
                          className={
                            isPlanned
                              ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-planned text-planned"
                              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary"
                          }
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={
                              isPlanned
                                ? "truncate font-medium text-planned"
                                : "truncate font-medium text-foreground"
                            }
                          >
                            {item.description}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {(item.categoryName ?? t("uncategorized")) +
                              " • " +
                              item.accountNickname}
                          </p>
                        </div>
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={
                            isPlanned
                              ? "font-semibold text-planned"
                              : item.direction === "credit"
                                ? "font-semibold text-accent"
                                : "font-semibold text-foreground"
                          }
                        >
                          {(item.direction === "credit" ? "+" : "-") +
                            formatMoney(item.amount, item.currency, locale)}
                        </span>
                        {isPlanned && (
                          <form action={confirmTransactionAction}>
                            <input
                              type="hidden"
                              name="transactionId"
                              value={item.id}
                            />
                            <input
                              type="hidden"
                              name="returnTo"
                              value="/transactions"
                            />
                            <button
                              type="submit"
                              aria-label={t("confirm")}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors hover:bg-accent/20"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <Link
        href="/transactions/new?returnTo=/transactions"
        aria-label={t("addTransaction")}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <PlusIcon className="h-6 w-6" />
      </Link>

      <BottomNav />
    </main>
  );
}
