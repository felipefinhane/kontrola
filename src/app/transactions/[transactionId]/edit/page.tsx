import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { listAccounts } from "@/db/queries/accounts";
import { listCategories } from "@/db/queries/categories";
import { getTransaction } from "@/db/queries/transactions";
import { ArrowLeftIcon } from "@/components/icons";
import { TransactionForm } from "../../transaction-form";

// Edit half of #9 — same screen/form as Add (docs/stitch-export/
// 05-add-edit-transaction.html covers both in one mockup), reached from
// #7 Account Detail's transaction rows.
export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [transaction, accounts, categories, t] = await Promise.all([
    getTransaction(session.user.id, transactionId),
    listAccounts(session.user.id),
    listCategories(session.user.id),
    getTranslations("Transaction"),
  ]);

  if (!transaction) {
    notFound();
  }

  const cancelHref = `/accounts/${transaction.accountId}`;

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
          transactionId={transactionId}
          defaultValues={{
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            direction: transaction.direction,
            description: transaction.description,
            amount: transaction.amount,
            occurredOn: transaction.occurredOn,
          }}
          cancelHref={cancelHref}
        />
      </div>
    </main>
  );
}
