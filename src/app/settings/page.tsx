import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getUserPreferences } from "@/db/queries/users";
import { locales } from "@/i18n/request";
import {
  BanknoteIcon,
  BellIcon,
  ChevronRightIcon,
  GlobeIcon,
  LockIcon,
  LogOutIcon,
  SunIcon,
} from "@/components/icons";
import { BottomNav } from "@/components/bottom-nav";
import { SettingsThemeToggle } from "./settings-theme-toggle";
import { SettingsCurrencySelect } from "./settings-currency-select";
import { updateLocale, logOut } from "./actions";

// Real Settings screen (docs/stitch-export/14-settings.html). Dropped,
// same "don't fabricate a feature/data we don't have" discipline as
// #6/#7/#8/#12: the fake profile photo + display name (no avatar field
// on `users`, no display name collected at #2 Sign Up — email is the
// only real identity data there is) and "Export my data" (no export
// feature built anywhere).
//
// #13's sync-direction decision: `users` is the durable source of truth
// (src/app/settings/actions.ts has the full writeup) — this page always
// reads fresh from the DB, never from the locale cookie or next-themes'
// localStorage, so it's never showing a stale value even if those drift.
export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [prefs, t] = await Promise.all([
    getUserPreferences(session.user.id),
    getTranslations("Settings"),
  ]);

  if (!prefs) {
    redirect("/login");
  }

  return (
    <main className="safe-top flex min-h-screen flex-col bg-background pb-28 text-foreground">
      <header className="px-4 py-4 text-center">
        <h1 className="text-xl font-bold text-primary">Kontrola</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 py-2">
        <section className="flex flex-col items-center gap-1 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-lg font-semibold text-primary">
            {prefs.email.charAt(0).toUpperCase()}
          </div>
          <p className="mt-2 text-sm text-foreground/80">{prefs.email}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="pl-1 text-xs font-semibold uppercase tracking-wider text-muted">
            {t("general")}
          </h3>
          <div className="flex flex-col divide-y divide-border rounded-xl bg-surface shadow-sm">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                  <GlobeIcon className="h-5 w-5" />
                </span>
                <span className="font-medium">{t("language")}</span>
              </div>
              <div className="flex rounded-lg bg-surface-variant p-1">
                {locales.map((locale) => (
                  <form key={locale} action={updateLocale} className="flex-1">
                    <input type="hidden" name="locale" value={locale} />
                    <button
                      type="submit"
                      className={`w-full rounded-md py-2 text-sm font-medium transition-colors ${
                        prefs.locale === locale
                          ? "bg-surface text-primary shadow-sm"
                          : "text-muted hover:bg-surface/50"
                      }`}
                    >
                      {t(`localeName.${locale}`)}
                    </button>
                  </form>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                  <SunIcon className="h-5 w-5" />
                </span>
                <span className="font-medium">{t("themeLabel")}</span>
              </div>
              <SettingsThemeToggle initialTheme={prefs.theme} />
            </div>

            <div className="flex min-h-[72px] items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                  <BanknoteIcon className="h-5 w-5" />
                </span>
                <span className="font-medium">{t("defaultCurrency")}</span>
              </div>
              <SettingsCurrencySelect initialCurrency={prefs.defaultCurrency} />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="pl-1 text-xs font-semibold uppercase tracking-wider text-muted">
            {t("notifications")}
          </h3>
          <Link
            href="/settings/notifications"
            className="flex min-h-[72px] items-center justify-between rounded-xl bg-surface p-4 shadow-sm transition-colors hover:bg-surface-variant"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                <BellIcon className="h-5 w-5" />
              </span>
              <span className="font-medium">{t("notificationSettings")}</span>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-muted" />
          </Link>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="pl-1 text-xs font-semibold uppercase tracking-wider text-muted">
            {t("security")}
          </h3>
          <div className="flex flex-col divide-y divide-border rounded-xl bg-surface shadow-sm">
            <Link
              href="/settings/change-password"
              className="flex min-h-[72px] items-center justify-between p-4 transition-colors hover:bg-surface-variant"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                  <LockIcon className="h-5 w-5" />
                </span>
                <span className="font-medium">{t("changePassword")}</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-muted" />
            </Link>
            <form action={logOut}>
              <button
                type="submit"
                className="flex min-h-[72px] w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-variant"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-error-container text-error">
                  <LogOutIcon className="h-5 w-5" />
                </span>
                <span className="font-medium text-error">
                  {t("logOut")}
                </span>
              </button>
            </form>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
