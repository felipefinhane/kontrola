import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { listAccountsWithBalances } from "@/db/queries/accounts";
import { listTransactions } from "@/db/queries/transactions";
import { groupAmountsByCurrency } from "@/lib/currency";
import { formatMoney, formatMoneyParts } from "@/lib/format-money";
import { getCategoryIcon } from "@/lib/category-icons";
import { BankIcon, PlusIcon, WalletIcon } from "@/components/icons";
import { BottomNav } from "@/components/bottom-nav";

// Real Home Dashboard (docs/stitch-export/04-home-dashboard.html) — the
// route BottomNav's "Home" tab has pointed at since #6 (`/home`, not `/`:
// `/` stays the public Onboarding screen, see src/proxy.ts's PUBLIC_ROUTES).
// Same drops as #6/#7/#8: no avatar/notification-bell top bar, no
// per-account icon variety (no `type` column on Account).
export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [accounts, recent, locale, t] = await Promise.all([
    listAccountsWithBalances(session.user.id),
    listTransactions(session.user.id, { status: "actual", limit: 5 }),
    getLocale(),
    getTranslations("Home"),
  ]);

  if (accounts.length === 0) {
    return (
      <main className="safe-top flex min-h-screen flex-col bg-background pb-28 text-foreground">
        <header className="px-4 py-4 text-center">
          <h1 className="text-xl font-bold text-primary">Kontrola</h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-surface shadow-sm">
            <WalletIcon className="h-14 w-14 text-accent" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-primary">
              {t("emptyTitle")}
            </h2>
            <p className="max-w-[280px] text-sm text-foreground/80">
              {t("emptyDescription")}
            </p>
          </div>
          <Link
            href="/accounts/new"
            className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-primary py-4 font-medium text-on-primary shadow-sm transition-transform active:scale-95"
          >
            <PlusIcon className="h-5 w-5" />
            {t("addAccount")}
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  const totals = groupAmountsByCurrency(
    accounts.map((a) => ({ currency: a.currency, amount: a.balance })),
  );

  return (
    <main className="safe-top flex min-h-screen flex-col bg-background pb-28 text-foreground">
      <header className="px-4 py-4 text-center">
        <h1 className="text-xl font-bold text-primary">Kontrola</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 py-2">
        <section className="flex flex-col items-center gap-1 py-2 text-center">
          <p className="text-xs font-medium text-muted">
            {t("totalBalance")}
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-4">
            {totals.map(({ currency, total }) => {
              const { whole, fraction } = formatMoneyParts(
                total,
                currency,
                locale,
              );
              return (
                <div key={currency} className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">
                    {whole}
                  </span>
                  <span className="text-sm font-semibold text-muted">
                    {fraction}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {accounts.map((account) => (
            <Link
              key={account.id}
              href={`/accounts/${account.id}`}
              className="flex min-w-[220px] snap-center flex-col gap-3 rounded-2xl border-b-2 border-primary bg-surface p-4 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary">
                  <BankIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {account.nickname}
                  </p>
                  <p className="truncate text-xs uppercase tracking-wider text-muted">
                    {account.bankName ?? account.currency}
                  </p>
                </div>
              </div>
              <p
                className={`text-lg font-semibold ${account.balance < 0 ? "text-debit" : "text-foreground"}`}
              >
                {formatMoney(account.balance, account.currency, locale)}
              </p>
            </Link>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">
              {t("recentTransactions")}
            </h2>
            <Link
              href="/transactions"
              className="text-sm font-medium text-primary"
            >
              {t("viewAll")}
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              {t("noTransactions")}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((item) => {
                const Icon = getCategoryIcon(item.categoryIcon);
                return (
                  <Link
                    key={item.id}
                    href={`/transactions/${item.id}/edit`}
                    className="flex items-center gap-3 rounded-xl bg-surface p-4 shadow-sm transition-transform active:scale-[0.98]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {item.description}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {(item.categoryName ?? t("uncategorized")) +
                          " • " +
                          item.accountNickname}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 font-semibold ${item.direction === "credit" ? "text-accent" : "text-foreground"}`}
                    >
                      {(item.direction === "credit" ? "+" : "-") +
                        formatMoney(item.amount, item.currency, locale)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Link
        href="/transactions/new?returnTo=/home"
        aria-label={t("addTransaction")}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <PlusIcon className="h-6 w-6" />
      </Link>

      <BottomNav />
    </main>
  );
}
