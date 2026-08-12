import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// No [locale] URL segment — this is an authenticated personal app, not a
// public site that needs per-locale SEO'd paths. Locale is a user
// preference (see CONTEXT.md / Settings screen), stored in a cookie and
// read here on every request. Defaults to English (ADR/CONTEXT.md: code
// and UI ship in English, with PT-BR as the second supported locale).
export const locales = ["en", "pt-BR"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const locale = (locales as readonly string[]).includes(cookieLocale ?? "")
    ? (cookieLocale as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
