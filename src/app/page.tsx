import { useTranslations } from "next-intl";

// Placeholder landing screen — proves the design tokens (globals.css),
// safe-area handling, and i18n pipeline all work end to end. Gets
// replaced by the real Onboarding screen (docs/stitch-export/01-onboarding.html).
export default function Home() {
  const t = useTranslations("Onboarding");

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-surface shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" className="h-14 w-14" />
      </div>
      <h1 className="text-3xl font-bold text-primary">Kontrola</h1>
      <p className="max-w-xs text-foreground/80">{t("tagline")}</p>
      <div className="flex w-full max-w-xs flex-col gap-3 pt-4">
        <button className="rounded-2xl bg-primary py-3.5 font-medium text-on-primary shadow-sm">
          {t("getStarted")}
        </button>
        <button className="rounded-2xl py-3.5 font-medium text-primary">
          {t("alreadyHaveAccount")}
        </button>
      </div>
    </main>
  );
}
