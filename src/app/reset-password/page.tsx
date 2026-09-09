import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { verifyPasswordResetToken } from "@/db/queries/password-reset";
import { LockIcon } from "@/components/icons";
import { ResetPasswordForm } from "./reset-password-form";

// #16, ADR-0012. No dedicated mockup exists for this half of the flow —
// docs/stitch-export/03b-forgot-password.html only covers requesting the
// link — so this borrows #14 Change Password's visual language (same
// two-field form, same hint/error treatment) rather than inventing a new
// pattern for one screen.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getTranslations("ResetPassword");

  const valid = token ? await verifyPasswordResetToken(token) : null;

  if (!token || !valid) {
    return (
      <main className="safe-top safe-bottom flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error-container text-error">
          <LockIcon className="h-6 w-6" />
        </span>
        <h1 className="text-xl font-bold text-primary">
          {t("invalidTitle")}
        </h1>
        <p className="max-w-xs text-sm text-foreground/80">
          {t("invalidDescription")}
        </p>
        <Link
          href="/forgot-password"
          className="mt-2 rounded-2xl bg-primary px-6 py-3 font-medium text-on-primary shadow-sm"
        >
          {t("requestNewLink")}
        </Link>
      </main>
    );
  }

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-8">
        <div className="mb-8 flex flex-col gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
            <LockIcon className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
          <p className="text-sm text-foreground/80">{t("subtitle")}</p>
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}
