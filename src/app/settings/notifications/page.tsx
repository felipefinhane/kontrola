import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getUserPreferences } from "@/db/queries/users";
import { ArrowLeftIcon, ClockIcon } from "@/components/icons";
import { PushToggle } from "./push-toggle";
import { InactivityStepper } from "./inactivity-stepper";
import { IosInstallBanner } from "./ios-install-banner";

// Real Notification Settings screen (docs/stitch-export/
// 12-notification-settings.html). Dropped the fake profile photo (same
// call as #13's Settings screen — no avatar field exists). Dropped the
// mockup's "How to install" link too — it points at "#" in the source,
// no real destination exists to send it to.
export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [prefs, t] = await Promise.all([
    getUserPreferences(session.user.id),
    getTranslations("Notifications"),
  ]);

  if (!prefs) {
    redirect("/login");
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ?? "";

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-background px-4 py-4">
        <Link
          href="/settings"
          aria-label={t("back")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-variant"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <span className="text-sm text-muted">{t("back")}</span>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
          <p className="text-sm text-foreground/80">{t("subtitle")}</p>
        </div>

        <section className="flex items-start justify-between gap-4 rounded-xl bg-surface p-5 shadow-sm">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-foreground">
              {t("enableTitle")}
            </h2>
            <p className="text-sm text-foreground/80">
              {t("enableDescription")}
            </p>
          </div>
          {vapidPublicKey ? (
            <PushToggle vapidPublicKey={vapidPublicKey} />
          ) : (
            <p className="shrink-0 text-xs text-muted">
              {t("unsupported")}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-xl bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
              <ClockIcon className="h-5 w-5" />
            </span>
            <h2 className="font-semibold text-foreground">
              {t("nudgeFrequency")}
            </h2>
          </div>
          <p className="text-sm text-foreground/80">
            {t("nudgeDescription")}
          </p>
          <InactivityStepper initialDays={prefs.inactivityReminderDays} />
        </section>

        <IosInstallBanner />
      </div>
    </main>
  );
}
