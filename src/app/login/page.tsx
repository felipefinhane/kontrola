import Link from "next/link";
import { useTranslations } from "next-intl";
import { LoginForm } from "./login-form";

// Real Log In screen (docs/stitch-export/03-log-in.html) — a centered
// card rather than #2 Sign Up's full-bleed layout, matching the source
// design. Same icon-set/no-Material-Symbols call as #1/#2, and the
// decorative background blobs are dropped (pure CSS flourish, no data,
// not worth the extra markup for a transactional screen).
export default function LoginPage() {
  const t = useTranslations("Login");

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10 text-foreground">
      <div className="flex w-full max-w-sm flex-col items-center gap-2 pb-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-11 w-11" />
        </div>
        <h1 className="mt-1 text-2xl font-bold text-primary">Kontrola</h1>
        <p className="text-sm text-foreground/80">{t("tagline")}</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-surface p-6 shadow-sm">
        <LoginForm />

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">{t("or")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="text-center text-sm text-foreground/80">
          {t("signUpPrompt")}{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("signUpLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
