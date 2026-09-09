"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { updateTheme } from "./actions";

const OPTIONS = ["light", "dark", "system"] as const;

// The one Settings control that's a client component — theme needs to
// apply instantly (next-themes toggling the `.dark` class), not wait for
// a server round-trip like updateLocale does. Persists to `users.theme`
// in the background via updateTheme(), no redirect.
export function SettingsThemeToggle({
  initialTheme,
}: {
  initialTheme: string;
}) {
  const t = useTranslations("Settings");
  const { theme, setTheme } = useTheme();
  // next-themes only knows the real value after mount (it reads
  // localStorage client-side) — show the DB's value until then so the
  // control isn't blank/wrong on first paint. This is next-themes' own
  // documented workaround for the hydration mismatch that otherwise
  // follows from server (no localStorage) and client disagreeing on
  // `theme` before mount.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount flag, not a derived/cascading update
  useEffect(() => setMounted(true), []);
  const current = mounted ? (theme ?? initialTheme) : initialTheme;

  function select(value: string) {
    setTheme(value);
    void updateTheme(value);
  }

  return (
    <div className="flex rounded-lg bg-surface-variant p-1">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => select(option)}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            current === option
              ? "bg-surface text-primary shadow-sm"
              : "text-muted hover:bg-surface/50"
          }`}
        >
          {t(`theme.${option}`)}
        </button>
      ))}
    </div>
  );
}
