import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getUserDefaultCurrency } from "@/db/queries/accounts";
import { ArrowLeftIcon } from "@/components/icons";
import { AddAccountForm } from "./add-account-form";

// Real Add Account screen (docs/stitch-export/09-add-account.html). Reads
// first — src/proxy.ts (#4) already blocks anonymous navigation here, but
// this route needs the session for its own reason: pre-filling the
// currency picker from users.defaultCurrency (CONTEXT.md's Currency
// entry — "a User's default currency is only a preference for pre-filling
// new Accounts"), not just for gatekeeping.
export default async function AddAccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const defaultCurrency = await getUserDefaultCurrency(session.user.id);
  const t = await getTranslations("AddAccount");

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-4">
        {/* /accounts (Accounts List, #6) doesn't exist yet — same
            link-to-a-future-route pattern as #1-#4. */}
        <Link
          href="/accounts"
          aria-label={t("back")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-variant"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-primary">{t("title")}</h1>
        <div className="h-10 w-10" />
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-8">
        <AddAccountForm defaultCurrency={defaultCurrency} />
      </div>
    </main>
  );
}
