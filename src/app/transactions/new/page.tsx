import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { listAccounts } from "@/db/queries/accounts";
import { listCategories } from "@/db/queries/categories";
import { ArrowLeftIcon } from "@/components/icons";
import { TransactionForm } from "../transaction-form";

// Real Add Transaction screen (docs/stitch-export/05-add-edit-transaction.html).
// Transactional/task-focused (matches the mockup's own "Simplified for
// transactional view" comment) — no bottom nav, same as #2/#5/#8's Add
// Category. Creates an `actual` Transaction by default; #11's "Add
// Planned" entry point passes `?status=planned` to create a `planned`
// one instead (the form itself has no status toggle, matching the
// mockup — the entry point decides, not the user mid-form).
//
// accountId/direction query params let #7's "Pay" quick action land here
// pre-filled; returnTo lets #11 send the user back to /planned instead
// of the Account Detail default. All optional — this route also works
// cold with none of them.
export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{
    accountId?: string;
    direction?: string;
    status?: string;
    returnTo?: string;
  }>;
}) {
  const { accountId, direction, status, returnTo } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [accounts, categories, t] = await Promise.all([
    listAccounts(session.user.id),
    listCategories(session.user.id),
    getTranslations("Transaction"),
  ]);

  // Nothing to attach a Transaction to yet — send them to create one
  // first rather than rendering a form with no Account option at all.
  if (accounts.length === 0) {
    redirect("/accounts/new");
  }

  const selectedAccountId =
    accountId && accounts.some((a) => a.id === accountId)
      ? accountId
      : accounts[0].id;
  const cancelHref =
    returnTo && returnTo.startsWith("/")
      ? returnTo
      : accountId
        ? `/accounts/${selectedAccountId}`
        : "/accounts";

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-4">
        <Link
          href={cancelHref}
          aria-label={t("cancel")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-variant"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-primary">{t("title")}</h1>
        <div className="h-10 w-10" />
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8">
        <TransactionForm
          accounts={accounts}
          categories={categories}
          status={status === "planned" ? "planned" : undefined}
          returnTo={returnTo}
          defaultValues={{
            accountId: selectedAccountId,
            direction: direction === "credit" ? "credit" : "debit",
            occurredOn: new Date().toISOString().slice(0, 10),
          }}
          cancelHref={cancelHref}
        />
      </div>
    </main>
  );
}
