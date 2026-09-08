"use client";

import { useActionState, useId, useState } from "react";
import { useTranslations } from "next-intl";
import {
  EditIcon,
  BankIcon,
  SearchIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@/components/icons";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { addAccount, type AddAccountState } from "./actions";

const initialState: AddAccountState = {};

// Quick-fill chips only — bankName stays a free-text column (CONTEXT.md:
// "free text, not an enum, banks aren't modeled"). Colors are these
// banks' own brand colors, used the same understated way any personal
// finance app does to make a chip recognizable at a glance.
const QUICK_BANKS = [
  { name: "Nubank", color: "#8A05BE" },
  { name: "Itaú", color: "#EC7000" },
  { name: "Bradesco", color: "#CC092F" },
] as const;

export function AddAccountForm({
  defaultCurrency,
}: {
  defaultCurrency: string;
}) {
  const t = useTranslations("AddAccount");
  const [state, formAction, pending] = useActionState(
    addAccount,
    initialState,
  );
  const [balance, setBalance] = useState("");
  const [bankName, setBankName] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const nicknameErrorId = useId();
  const balanceErrorId = useId();

  return (
    <form action={formAction} className="flex flex-1 flex-col gap-6">
      <p className="text-sm text-foreground/80">{t("subtitle")}</p>

      <section className="flex flex-col items-center gap-3 rounded-3xl bg-surface p-6 shadow-sm">
        <label
          htmlFor="openingBalance"
          className="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          {t("openingBalanceLabel")}
        </label>
        <div className="flex items-baseline gap-2">
          <CurrencySymbol currency={currency} />
          <input
            id="openingBalance"
            name="openingBalance"
            inputMode="decimal"
            placeholder="0.00"
            value={balance}
            onChange={(e) =>
              setBalance(e.target.value.replace(/[^\d.]/g, ""))
            }
            aria-invalid={state.fieldErrors?.openingBalance ? true : undefined}
            aria-describedby={
              state.fieldErrors?.openingBalance ? balanceErrorId : undefined
            }
            className="w-full max-w-[200px] border-none bg-transparent p-0 text-center text-3xl font-bold text-primary outline-none placeholder:text-border"
          />
        </div>
        {state.fieldErrors?.openingBalance && (
          <p id={balanceErrorId} className="text-xs text-error">
            {t("errors.invalidBalance")}
          </p>
        )}
        <div className="relative mt-1 w-full max-w-[140px]">
          <select
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-xl border-none bg-primary-light py-2 pl-4 pr-8 text-center text-sm font-medium text-primary outline-none"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.symbol}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <label htmlFor="nickname" className="ml-1 text-sm font-medium">
          {t("nicknameLabel")}
        </label>
        <div className="relative">
          <EditIcon className="pointer-events-none absolute inset-y-0 left-4 my-auto h-5 w-5 text-muted" />
          <input
            id="nickname"
            name="nickname"
            placeholder={t("nicknamePlaceholder")}
            aria-invalid={state.fieldErrors?.nickname ? true : undefined}
            aria-describedby={
              state.fieldErrors?.nickname ? nicknameErrorId : undefined
            }
            className="w-full rounded-xl border border-transparent bg-primary-light py-4 pl-12 pr-4 text-foreground placeholder-muted transition-colors focus:border-primary focus:outline-none"
          />
        </div>
        {state.fieldErrors?.nickname && (
          <p id={nicknameErrorId} className="ml-1 text-xs text-error">
            {t("errors.nicknameRequired")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="ml-1 text-sm font-medium">
          {t("institutionLabel")}
        </label>
        <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-1 pt-1">
          {QUICK_BANKS.map((bank) => (
            <button
              key={bank.name}
              type="button"
              onClick={() => setBankName(bank.name)}
              className="flex h-24 w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl bg-surface shadow-sm transition-transform active:scale-95"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${bank.color}1a`, color: bank.color }}
              >
                <BankIcon className="h-5 w-5" />
              </span>
              <span className="text-xs text-foreground">{bank.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setBankName("")}
            className="flex h-24 w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl bg-surface shadow-sm transition-transform active:scale-95"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-variant text-muted">
              <SearchIcon className="h-5 w-5" />
            </span>
            <span className="text-xs text-muted">{t("otherBank")}</span>
          </button>
        </div>
        <div className="relative">
          <BankIcon className="pointer-events-none absolute inset-y-0 left-4 my-auto h-5 w-5 text-muted" />
          <input
            name="bankName"
            placeholder={t("bankNamePlaceholder")}
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full rounded-xl border border-transparent bg-primary-light py-4 pl-12 pr-4 text-foreground placeholder-muted transition-colors focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-on-primary shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          <CheckIcon className="h-5 w-5" />
          {pending ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}

function CurrencySymbol({ currency }: { currency: string }) {
  const symbol =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "";
  return (
    <span className="text-xl font-semibold text-muted">{symbol}</span>
  );
}
