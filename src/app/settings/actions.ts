"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { auth } from "@/auth";
import { updateUserPreferences } from "@/db/queries/users";
import { locales } from "@/i18n/request";
import { isSupportedCurrency } from "@/lib/currency";

// #13's "decide the sync direction" call: the `users` row is the durable
// source of truth (so a preference follows a User to a new device/
// browser); the `locale` cookie / next-themes' localStorage stay fast
// per-request reads, write-through updated here on every save. Known
// gap, not done here: signing in on a *different* browser doesn't yet
// pull the DB values back into that browser's cookie/localStorage —
// only this screen writes them. Scoped out to keep #13 contained; see
// docs/TASKS.md.

const THEMES = ["light", "dark", "system"];

export async function updateLocale(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const locale = String(formData.get("locale") ?? "");
  if (!(locales as readonly string[]).includes(locale)) {
    return;
  }

  await updateUserPreferences(session.user.id, { locale });

  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  // Every string on this page comes from the locale that just changed —
  // unlike theme (a CSS class swap next-themes applies instantly on the
  // client), there's no way to reflect this without a fresh server
  // render picking up the new cookie.
  redirect("/settings");
}

// No redirect: theme applies instantly client-side via next-themes
// (settings-theme-toggle.tsx calls setTheme() itself) — this just
// persists the choice to `users.theme` quietly in the background.
export async function updateTheme(theme: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }
  if (!THEMES.includes(theme)) {
    return;
  }
  await updateUserPreferences(session.user.id, { theme });
}

// No redirect either, same reasoning as updateTheme — a default currency
// only ever affects a *future* #5 Add Account's pre-fill, nothing visible
// on this page needs to change right away.
export async function updateDefaultCurrency(currency: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }
  if (!isSupportedCurrency(currency)) {
    return;
  }
  await updateUserPreferences(session.user.id, { defaultCurrency: currency });
}

export async function logOut() {
  await signOut({ redirectTo: "/login" });
}
