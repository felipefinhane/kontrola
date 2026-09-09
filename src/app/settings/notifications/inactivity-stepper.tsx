"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateInactivityDays } from "./actions";

const MIN_DAYS = 1;
const MAX_DAYS = 14;

export function InactivityStepper({ initialDays }: { initialDays: number }) {
  const t = useTranslations("Notifications");
  const [days, setDays] = useState(initialDays);

  function change(delta: number) {
    const next = Math.min(MAX_DAYS, Math.max(MIN_DAYS, days + delta));
    if (next === days) return;
    setDays(next);
    void updateInactivityDays(next);
  }

  return (
    <div className="mx-auto flex w-full max-w-[220px] items-center justify-between rounded-lg bg-surface-variant p-2">
      <button
        type="button"
        aria-label={t("decreaseDays")}
        onClick={() => change(-1)}
        disabled={days <= MIN_DAYS}
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface text-primary shadow-sm transition-transform active:scale-95 disabled:opacity-40"
      >
        <span className="text-xl leading-none">−</span>
      </button>
      <div className="flex flex-col items-center px-4">
        <span className="text-2xl font-bold leading-none text-primary">
          {days}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
          {t("days")}
        </span>
      </div>
      <button
        type="button"
        aria-label={t("increaseDays")}
        onClick={() => change(1)}
        disabled={days >= MAX_DAYS}
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface text-primary shadow-sm transition-transform active:scale-95 disabled:opacity-40"
      >
        <span className="text-xl leading-none">+</span>
      </button>
    </div>
  );
}
