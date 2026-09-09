"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { updateDefaultCurrency } from "./actions";

// Same instant-persist-no-redirect pattern as settings-theme-toggle.tsx —
// only affects a future #5 Add Account's pre-fill, nothing on this page.
export function SettingsCurrencySelect({
  initialCurrency,
}: {
  initialCurrency: string;
}) {
  const [value, setValue] = useState(initialCurrency);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          void updateDefaultCurrency(e.target.value);
        }}
        className="cursor-pointer appearance-none rounded-lg border-none bg-transparent py-1 pl-2 pr-6 text-sm font-medium text-muted outline-none"
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.symbol}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}
