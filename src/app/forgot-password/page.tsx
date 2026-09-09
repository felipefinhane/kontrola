import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeftIcon, LockIcon } from "@/components/icons";
import { ForgotPasswordForm } from "./forgot-password-form";

// Real Forgot Password screen (docs/stitch-export/03b-forgot-password.html)
// — #16, ADR-0012. Transactional/task-focused, no bottom nav, same as
// every other auth screen.
export default async function ForgotPasswordPage() {
  const t = await getTranslations("ForgotPassword");

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center px-4 py-4">
        <Link
          href="/login"
          aria-label={t("back")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-variant"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8">
        <div className="mb-8 flex flex-col gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
            <LockIcon className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
          <p className="text-sm text-foreground/80">{t("subtitle")}</p>
        </div>

        <ForgotPasswordForm />

        <Link
          href="/login"
          className="mt-4 py-3 text-center text-sm font-medium text-primary"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </main>
  );
}
