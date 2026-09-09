import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeftIcon } from "@/components/icons";
import { ChangePasswordForm } from "./change-password-form";

// Real Change Password screen (docs/stitch-export/14b-change-password.html).
// Same server-side password rule as #2 Sign Up (src/lib/validation.ts),
// per this task's own note. Dropped the mockup's 3-segment strength
// meter — same call #2 made, the underlying rule is binary.
export default async function ChangePasswordPage() {
  const t = await getTranslations("ChangePassword");

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-4">
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

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8">
        <ChangePasswordForm />
      </div>
    </main>
  );
}
