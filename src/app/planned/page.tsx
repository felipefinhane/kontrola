import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { listTransactions } from "@/db/queries/transactions";
import { formatMoney } from "@/lib/format-money";
import { getCategoryIcon } from "@/lib/category-icons";
import { CalendarIcon, CheckIcon, InfoIcon, PlusIcon } from "@/components/icons";
import { BottomNav } from "@/components/bottom-nav";
import { confirmTransactionAction } from "../transactions/actions";

// Real Planned view (docs/stitch-export/11-planned-view.html). Grilling
// decision recorded in docs/TASKS.md #11: MVP does let a User create a
// `planned` Transaction directly (the FAB here, via #9's shared form
// with `?status=planned`) rather than leaving this screen empty until
// RecurringTemplate (v1.1) ships — the original spreadsheet's manual
// forecast-months pattern was exactly this, done by hand.
//
// Two buckets instead of the mockup's "Upcoming"/"Next Week": "Upcoming"
// (overdue through the next 7 days) and "Later" — a fixed "next week"
// bucket reads oddly once items are more than 2 weeks out, and this
// still reads as forward-looking without the edge cases.
export default async function PlannedPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [items, locale, t] = await Promise.all([
    listTransactions(session.user.id, { status: "planned", order: "asc" }),
    getLocale(),
    getTranslations("Planned"),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;

  function relativeLabel(occurredOn: string): string {
    const date = new Date(`${occurredOn}T00:00:00`);
    const diffDays = Math.round((date.getTime() - today.getTime()) / dayMs);
    if (diffDays === 0) return t("today");
    if (diffDays === 1) return t("tomorrow");
    if (diffDays < 0) return t("overdue");
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
    }).format(date);
  }

  const upcoming = items.filter((item) => {
    const diffDays = Math.round(
      (new Date(`${item.occurredOn}T00:00:00`).getTime() - today.getTime()) /
        dayMs,
    );
    return diffDays <= 7;
  });
  const later = items.filter((item) => !upcoming.includes(item));

  function renderRow(item: (typeof items)[number]) {
    const Icon = getCategoryIcon(item.categoryIcon);
    return (
      <div
        key={item.id}
        className="flex items-center gap-2 rounded-xl border-[1.5px] border-dashed border-planned bg-surface p-4"
      >
        <Link
          href={`/transactions/${item.id}/edit`}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">
              {item.description}
            </p>
            <p className="text-xs text-muted">
              {relativeLabel(item.occurredOn)} • {item.accountNickname}
            </p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-semibold text-planned">
            {(item.direction === "credit" ? "+" : "-") +
              formatMoney(item.amount, item.currency, locale)}
          </span>
          <form action={confirmTransactionAction}>
            <input type="hidden" name="transactionId" value={item.id} />
            <input type="hidden" name="returnTo" value="/planned" />
            <button
              type="submit"
              aria-label={t("confirm")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors hover:bg-accent/20"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="safe-top flex min-h-screen flex-col bg-background pb-28 text-foreground">
      <header className="sticky top-0 z-10 bg-background px-4 py-4">
        <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 py-2">
        <div className="flex items-start gap-3 rounded-xl bg-primary-light p-4">
          <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h2 className="mb-1 font-semibold text-primary">
              {t("bannerTitle")}
            </h2>
            <p className="text-sm text-foreground/80">{t("bannerBody")}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <CalendarIcon className="h-10 w-10 text-muted" />
            <p className="text-sm text-muted">{t("empty")}</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="pl-1 text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("upcoming")}
                </h3>
                <div className="flex flex-col gap-2">
                  {upcoming.map(renderRow)}
                </div>
              </section>
            )}
            {later.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="pl-1 text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("later")}
                </h3>
                <div className="flex flex-col gap-2">{later.map(renderRow)}</div>
              </section>
            )}
          </>
        )}
      </div>

      <Link
        href="/transactions/new?status=planned&returnTo=/planned"
        aria-label={t("addPlanned")}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <PlusIcon className="h-6 w-6" />
      </Link>

      <BottomNav />
    </main>
  );
}
