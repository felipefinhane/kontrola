import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getAccountWithBalance } from "@/db/queries/accounts";
import { getAccountTransactions } from "@/db/queries/transactions";
import { formatMoney, formatMoneyParts } from "@/lib/format-money";
import { getCategoryIcon } from "@/lib/category-icons";
import { groupByDate } from "@/lib/date-groups";
import { ArrowLeftIcon, BankIcon, BanknoteIcon } from "@/components/icons";
import { BottomNav } from "@/components/bottom-nav";

// Real Account Detail screen (docs/stitch-export/08-account-detail.html).
//
// Dropped, same "don't fabricate a feature/data we don't have" discipline
// as #6/#8: the masked card number ("•••• 4092" — no such field exists,
// Account has no card number), the profile-photo/notification-bell top
// bar (see #6's note), and the "Transfer" quick action (no multi-account
// transfer feature is designed anywhere — AccountMember/sharing is v3).
// "Pay" survives as a *real* shortcut instead of a dead button: it's just
// a pre-filled link into #9's Add Transaction (debit, this Account),
// which exists now that #9 landed in the same pass as this screen.
export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [account, transactions, locale, t] = await Promise.all([
    getAccountWithBalance(session.user.id, accountId),
    getAccountTransactions(session.user.id, accountId),
    getLocale(),
    getTranslations("AccountDetail"),
  ]);

  // RLS returns null both for "doesn't exist" and "belongs to someone
  // else" — same response either way, no ownership leaked via a 403 vs.
  // 404 distinction.
  if (!account) {
    notFound();
  }

  const { whole, fraction } = formatMoneyParts(
    account.balance,
    account.currency,
    locale,
  );
  const dateGroups = groupByDate(transactions, (t) => t.occurredOn);

  return (
    <main className="safe-top flex min-h-screen flex-col bg-background pb-28 text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-4">
        <Link
          href="/accounts"
          aria-label={t("back")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-variant"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="max-w-[60%] truncate text-lg font-semibold text-primary">
          {account.nickname}
        </h1>
        <div className="h-10 w-10" />
      </header>

      <div className="flex flex-col gap-6 px-4 py-2">
        <section className="relative overflow-hidden rounded-2xl border-b-[3px] border-primary bg-surface p-6 shadow-sm">
          <div className="relative z-10 mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
              <BankIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">
                  {account.nickname}
                </h2>
                <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[10px] font-medium text-muted">
                  {account.currency}
                </span>
              </div>
              {account.bankName && (
                <p className="text-xs text-muted">{account.bankName}</p>
              )}
            </div>
          </div>

          <div className="relative z-10">
            <p className="mb-1 text-xs text-muted">
              {t("availableBalance")}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-primary">
                {whole}
              </span>
              <span className="text-lg font-semibold text-muted">
                {fraction}
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-6">
            <Link
              href={`/transactions/new?accountId=${account.id}&direction=debit`}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary-light py-3 font-medium text-primary transition-colors hover:bg-surface-variant active:scale-95"
            >
              <BanknoteIcon className="h-4 w-4" />
              {t("pay")}
            </Link>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-lg font-semibold text-primary">
            {t("recentActivity")}
          </h3>

          {dateGroups.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              {t("noTransactions")}
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {dateGroups.map(({ key, items }) => (
                <div key={key} className="flex flex-col gap-2">
                  <h4 className="pl-1 text-xs font-medium uppercase tracking-wider text-muted">
                    {key === "today" || key === "yesterday"
                      ? t(key)
                      : new Intl.DateTimeFormat(locale, {
                          day: "numeric",
                          month: "long",
                        }).format(new Date(`${key}T00:00:00`))}
                  </h4>
                  <div className="flex flex-col gap-2">
                    {items.map((transaction) => {
                      const Icon = getCategoryIcon(transaction.categoryIcon);
                      const isPlanned = transaction.status === "planned";
                      return (
                        <Link
                          key={transaction.id}
                          href={`/transactions/${transaction.id}/edit`}
                          className={
                            isPlanned
                              ? "flex items-center gap-3 rounded-xl border-[1.5px] border-dashed border-planned bg-background p-4 transition-transform active:scale-[0.98]"
                              : "flex items-center gap-3 rounded-xl bg-surface p-4 shadow-sm transition-transform active:scale-[0.98]"
                          }
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
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted">
                              {transaction.categoryName ?? t("uncategorized")}
                              {isPlanned ? ` • ${t("planned")}` : ""}
                            </p>
                          </div>
                          <span
                            className={
                              isPlanned
                                ? "shrink-0 font-semibold text-planned"
                                : transaction.direction === "credit"
                                  ? "shrink-0 font-semibold text-accent"
                                  : "shrink-0 font-semibold text-foreground"
                            }
                          >
                            {(transaction.direction === "credit" ? "+" : "-") +
                              formatMoney(
                                transaction.amount,
                                transaction.currency,
                                locale,
                              )}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
