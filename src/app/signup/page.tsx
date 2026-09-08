import Link from "next/link";
import { useTranslations } from "next-intl";
import { SignUpForm } from "./signup-form";

// Real Sign Up screen (docs/stitch-export/02-sign-up.html), mobile layout
// only — same call as #1 Onboarding: the desktop split-pane marketing
// panel (testimonial quote, fake "Jane S." avatar) is decorative content
// tied to no real data, not worth porting for the MVP. The 3-segment
// password-strength meter is dropped too: the underlying rule is binary
// (meets the bar or not — see src/lib/validation.ts), so a graduated
// meter would be UI theater over a pass/fail check.
export default function SignUpPage() {
  const t = useTranslations("SignUp");

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col items-center bg-background px-6 py-10 text-foreground">
      <div className="flex w-full max-w-md flex-col items-center gap-2 pb-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-11 w-11" />
        </div>
        <h1 className="mt-1 text-2xl font-bold text-primary">Kontrola</h1>
      </div>

      <div className="flex w-full max-w-md flex-1 flex-col justify-center gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-foreground/80">{t("subtitle")}</p>
        </div>

        <SignUpForm />

        <p className="text-center text-sm text-foreground/80">
          {t("loginPrompt")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
