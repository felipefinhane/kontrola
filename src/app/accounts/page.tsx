import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { listAccountsWithBalances } from "@/db/queries/accounts";
import { groupAmountsByCurrency } from "@/lib/currency";
import { formatMoney, formatMoneyParts } from "@/lib/format-money";
import { BankIcon, PlusIcon, WalletIcon } from "@/components/icons";
import { BottomNav } from "@/components/bottom-nav";

// Real Accounts List + Empty State screens (docs/stitch-export/
// 07-accounts-list.html, 13-accounts-empty-state.html) — one route, two
// states of the same data, not two separate flows (that's how the Stitch
// export itself names the empty one: "Accounts (Empty)", a state of this
// screen, not a different one).
//
// Dropped from the mockup, both as "don't fabricate a feature/data we
// don't have" calls: the profile-photo/notification-bell top bar (no
// avatar field on User, no in-app notification feed — only PushSubscription
// device registration, #15) collapses to a plain wordmark; the per-account
// icon/accent-color variety and the trending-up/down glyphs (no `type` on
// Account, no historical-balance-trend feature) collapse to one consistent
// card style, with color only carrying real information — negative vs.
// non-negative balance.
export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [accounts, locale, t] = await Promise.all([
    listAccountsWithBalances(session.user.id),
    getLocale(),
    getTranslations("Accounts"),
  ]);

  const totals = groupAmountsByCurrency(
    accounts.map((a) => ({ currency: a.currency, amount: a.balance })),
  );

  return (
    <main className="safe-top flex min-h-screen flex-col bg-background pb-28 text-foreground">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 text-center">
        <h1 className="text-xl font-bold text-primary">Kontrola</h1>
      </header>

      {accounts.length === 0 ? (
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
      ) : (
        <div className="flex flex-col gap-6 px-4 py-2">
          <section className="rounded-xl bg-surface p-6 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              {t("totalBalance")}
            </h2>
            <div className="flex flex-col gap-1">
              {totals.map(({ currency, total }, i) => {
                const { whole, fraction } = formatMoneyParts(
                  total,
                  currency,
                  locale,
                );
                return (
                  <div
                    key={currency}
                    className={`flex items-baseline gap-1 ${i > 0 ? "opacity-70" : ""}`}
                  >
                    <span
                      className={
                        i === 0
                          ? "text-3xl font-bold text-primary"
                          : "text-xl font-semibold text-primary"
                      }
                    >
                      {whole}
                    </span>
                    <span className="text-base font-semibold text-muted">
                      {fraction}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-primary">
              {t("linkedAccounts")}
            </h3>
            {accounts.map((account) => (
              <Link
                key={account.id}
                href={`/accounts/${account.id}`}
                className="flex items-center justify-between rounded-xl bg-surface p-4 shadow-sm transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                    <BankIcon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted">
                      {account.bankName
                        ? `${account.bankName} • ${account.currency}`
                        : account.currency}
                    </span>
                    <span className="font-semibold text-foreground">
                      {account.nickname}
                    </span>
                  </div>
                </div>
                <span
                  className={`font-semibold ${account.balance < 0 ? "text-debit" : "text-primary"}`}
                >
                  {formatMoney(account.balance, account.currency, locale)}
                </span>
              </Link>
            ))}

            <Link
              href="/accounts/new"
              className="mt-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/20 py-4 text-primary transition-colors hover:bg-primary-light/50"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="text-sm font-medium">{t("addAccount")}</span>
            </Link>
          </section>
        </div>
      )}

      {/* /transactions/new doesn't exist yet (#9) — same forward-link
          pattern as everywhere else so far. */}
      <Link
        href="/transactions/new"
        aria-label={t("addTransaction")}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <PlusIcon className="h-6 w-6" />
      </Link>

      <BottomNav />
    </main>
  );
}
