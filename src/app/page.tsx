import Link from "next/link";
import { useTranslations } from "next-intl";

// Real Onboarding screen (docs/stitch-export/01-onboarding.html): logo +
// tagline, an "Add to Home Screen" callout (the PWA install path is how
// push notifications get enabled — see #15 in docs/TASKS.md), and the two
// entry points into auth. /signup and /login don't exist until #2/#3 land.
export default function Home() {
  const t = useTranslations("Onboarding");

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col items-center bg-background px-6 py-10 text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-surface shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-16 w-16" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">Kontrola</h1>
          <p className="max-w-[280px] text-foreground/80">{t("tagline")}</p>
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3 pb-4">
        <div className="flex items-start gap-3 rounded-xl bg-surface-variant p-4">
          <div className="flex-shrink-0 rounded-full bg-accent/10 p-2 text-accent">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 3v12" />
              <path d="M7 8l5-5 5 5" />
              <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
            </svg>
          </div>
          <div className="flex-1 space-y-1 text-left">
            <p className="text-sm font-medium text-foreground">
              {t("addToHomeScreenTitle")}
            </p>
            <p className="text-xs text-muted">
              {t("addToHomeScreenInstruction")}
            </p>
          </div>
        </div>

        <Link
          href="/signup"
          className="rounded-2xl bg-primary py-3.5 text-center font-medium text-on-primary shadow-sm transition-transform active:scale-95"
        >
          {t("getStarted")}
        </Link>
        <Link
          href="/login"
          className="rounded-2xl py-3.5 text-center font-medium text-primary transition-colors active:bg-primary-light/50"
        >
          {t("alreadyHaveAccount")}
        </Link>
      </div>
    </main>
  );
}
