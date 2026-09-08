import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import {
  listCategories,
  getCategorySpendThisMonth,
} from "@/db/queries/categories";
import { groupAmountsByCurrency } from "@/lib/currency";
import { formatMoney, formatMoneyParts } from "@/lib/format-money";
import { getCategoryIcon } from "@/lib/category-icons";
import { ArrowLeftIcon, PlusIcon } from "@/components/icons";
import { BottomNav } from "@/components/bottom-nav";

// Real Categories screen (docs/stitch-export/10-categories.html) — grid
// of system-default + custom Categories, "Total Spend (This Month)"
// computed for real from actual/debit Transactions grouped by Currency
// (ADR-0007: the mockup's single blended "$3,450.00" doesn't hold once
// an Account can be in a different Currency — same rule #6 applies to
// Total Balance). Nested under /settings (route doesn't exist yet, #13)
// rather than a top-level path — matches the Stitch export's own comment
// debating whether Categories needs the bottom-nav shell at all, landing
// on "yes, but it's a sub-page reached from Settings."
export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [categories, spendRows, locale, t] = await Promise.all([
    listCategories(session.user.id),
    getCategorySpendThisMonth(session.user.id),
    getLocale(),
    getTranslations("Categories"),
  ]);

  // Per-category tiles skip the null (uncategorized) bucket — there's no
  // tile for it — but the grand total below deliberately includes every
  // row, null bucket included: "Total Spend" means total, not "total of
  // what happened to get tagged."
  const spendByCategory = new Map<
    string,
    { currency: string; total: number }[]
  >();
  for (const row of spendRows) {
    if (!row.categoryId) continue;
    const list = spendByCategory.get(row.categoryId) ?? [];
    list.push({ currency: row.currency, total: row.total });
    spendByCategory.set(row.categoryId, list);
  }

  const totalSpend = groupAmountsByCurrency(
    spendRows.map((r) => ({ currency: r.currency, amount: r.total })),
  );

  return (
    <main className="safe-top flex min-h-screen flex-col bg-background pb-28 text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-4">
        {/* /settings (#13) doesn't exist yet — same forward-link pattern
            as everywhere else so far. */}
        <Link
          href="/settings"
          aria-label={t("back")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-variant"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-primary">{t("title")}</h1>
        <div className="h-10 w-10" />
      </header>

      <div className="flex flex-col gap-6 px-4 py-2">
        <div className="flex flex-col items-center gap-1 py-2 text-center">
          <p className="text-xs font-medium text-muted">
            {t("totalSpendLabel")}
          </p>
          {totalSpend.length === 0 ? (
            <p className="mt-1 text-sm text-muted">{t("noSpendYet")}</p>
          ) : (
            <div className="mt-1 flex flex-col gap-1">
              {totalSpend.map(({ currency, total }, i) => {
                const { whole, fraction } = formatMoneyParts(
                  total,
                  currency,
                  locale,
                );
                return (
                  <div
                    key={currency}
                    className={`flex items-baseline gap-1 justify-center ${i > 0 ? "opacity-70" : ""}`}
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
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            const spend = spendByCategory.get(category.id) ?? [];
            return (
              <div
                key={category.id}
                className="flex flex-col items-start gap-3 rounded-2xl bg-surface p-4 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {category.name}
                  </h3>
                  {spend.length > 0 && (
                    <div className="mt-1 flex flex-col">
                      {spend.map(({ currency, total }) => (
                        <span key={currency} className="text-sm text-muted">
                          {formatMoney(total, currency, locale)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <Link
            href="/settings/categories/new"
            className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-center transition-colors hover:bg-surface-variant"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-variant text-muted">
              <PlusIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-muted">
              {t("addCategory")}
            </span>
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
