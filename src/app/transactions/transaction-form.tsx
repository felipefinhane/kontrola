"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { getCategoryIcon } from "@/lib/category-icons";
import { EditIcon, CalendarIcon, ChevronDownIcon, BankIcon } from "@/components/icons";
import { saveTransaction, type TransactionFormState } from "./actions";

const initialState: TransactionFormState = {};

type AccountOption = { id: string; nickname: string; currency: string };
type CategoryOption = { id: string; name: string; icon: string | null };

export function TransactionForm({
  accounts,
  categories,
  transactionId,
  defaultValues,
  cancelHref,
}: {
  accounts: AccountOption[];
  categories: CategoryOption[];
  // Present -> edit (updates that row); absent -> create. One shared
  // action either way — see src/app/transactions/actions.ts for why this
  // isn't `.bind()`-ed in instead.
  transactionId?: string;
  defaultValues: {
    accountId: string;
    categoryId?: string | null;
    direction: "credit" | "debit";
    description?: string;
    amount?: number;
    occurredOn: string;
  };
  cancelHref: string;
}) {
  const t = useTranslations("Transaction");
  const [state, formAction, pending] = useActionState(
    saveTransaction,
    initialState,
  );

  const [direction, setDirection] = useState(defaultValues.direction);
  const [accountId, setAccountId] = useState(defaultValues.accountId);
  const [amount, setAmount] = useState(
    defaultValues.amount ? defaultValues.amount.toFixed(2) : "",
  );
  const [categoryId, setCategoryId] = useState(defaultValues.categoryId ?? "");

  const currency = useMemo(
    () => accounts.find((a) => a.id === accountId)?.currency ?? "BRL",
    [accounts, accountId],
  );
  const currencySymbol =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? "";

  const isCredit = direction === "credit";

  return (
    <form action={formAction} className="flex flex-1 flex-col gap-6">
      <input type="hidden" name="direction" value={direction} />
      {transactionId && (
        <input type="hidden" name="transactionId" value={transactionId} />
      )}

      {/* Credit / Debit segmented toggle */}
      <div className="mx-auto flex w-full max-w-[240px] rounded-xl bg-surface-variant p-1">
        <button
          type="button"
          onClick={() => setDirection("credit")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            isCredit ? "bg-accent text-on-accent shadow-sm" : "text-muted"
          }`}
        >
          {t("credit")}
        </button>
        <button
          type="button"
          onClick={() => setDirection("debit")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            !isCredit ? "bg-debit text-on-primary shadow-sm" : "text-muted"
          }`}
        >
          {t("debit")}
        </button>
      </div>

      {/* Amount */}
      <div className="flex flex-col items-center gap-1">
        <div
          className={`flex items-baseline gap-2 ${isCredit ? "text-accent" : "text-debit"}`}
        >
          <span className="text-2xl font-bold opacity-60">
            {currencySymbol}
          </span>
          <input
            name="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            aria-invalid={state.fieldErrors?.amount ? true : undefined}
            className="w-full max-w-[220px] border-none bg-transparent p-0 text-center text-3xl font-bold outline-none placeholder:opacity-40"
          />
        </div>
        {state.fieldErrors?.amount && (
          <p className="text-xs text-error">{t("errors.invalidAmount")}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* Description */}
        <div className="flex items-center gap-3 rounded-xl bg-primary-light p-3">
          <EditIcon className="h-5 w-5 shrink-0 text-primary/60" />
          <input
            name="description"
            defaultValue={defaultValues.description}
            placeholder={t("descriptionPlaceholder")}
            aria-invalid={state.fieldErrors?.description ? true : undefined}
            className="w-full border-none bg-transparent p-0 text-primary outline-none placeholder:text-primary/50"
          />
        </div>
        {state.fieldErrors?.description && (
          <p className="-mt-2 ml-1 text-xs text-error">
            {t("errors.descriptionRequired")}
          </p>
        )}

        {/* Account picker */}
        <div className="relative flex items-center gap-3 rounded-xl bg-primary-light p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
            <BankIcon className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider text-primary/60">
              {t("accountLabel")}
            </div>
            <select
              name="accountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full cursor-pointer appearance-none border-none bg-transparent p-0 font-semibold text-primary outline-none"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nickname} ({a.currency})
                </option>
              ))}
            </select>
          </div>
          <ChevronDownIcon className="h-5 w-5 shrink-0 text-primary" />
        </div>
        {state.fieldErrors?.accountId && (
          <p className="-mt-2 ml-1 text-xs text-error">
            {t("errors.accountRequired")}
          </p>
        )}

        {/* Date */}
        <div className="flex items-center gap-3 rounded-xl bg-primary-light p-3">
          <CalendarIcon className="h-5 w-5 shrink-0 text-primary/60" />
          <input
            type="date"
            name="occurredOn"
            defaultValue={defaultValues.occurredOn}
            aria-invalid={state.fieldErrors?.occurredOn ? true : undefined}
            className="w-full border-none bg-transparent p-0 text-primary outline-none"
          />
        </div>
        {state.fieldErrors?.occurredOn && (
          <p className="-mt-2 ml-1 text-xs text-error">
            {t("errors.dateInvalid")}
          </p>
        )}
      </div>

      {/* Category grid — optional, so nothing needs to start selected */}
      <div>
        <h3 className="mb-2 px-1 text-sm font-medium text-muted">
          {t("categoryLabel")}
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            const selected = categoryId === category.id;
            return (
              <label
                key={category.id}
                className="flex cursor-pointer flex-col items-center gap-1.5"
              >
                <input
                  type="radio"
                  name="categoryId"
                  value={category.id}
                  checked={selected}
                  onChange={() => setCategoryId(category.id)}
                  className="sr-only"
                />
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                    selected
                      ? isCredit
                        ? "border-accent text-accent"
                        : "border-debit text-debit"
                      : "border-transparent bg-surface-variant text-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-center text-xs text-foreground">
                  {category.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-auto flex gap-3 pt-4">
        <Link
          href={cancelHref}
          className="flex flex-1 items-center justify-center rounded-2xl bg-surface-variant py-4 font-medium text-foreground transition-transform active:scale-[0.98]"
        >
          {t("cancel")}
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-on-primary shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
