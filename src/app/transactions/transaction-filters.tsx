"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "@/components/icons";

type AccountOption = { id: string; nickname: string };
type CategoryOption = { id: string; name: string };

// URL-driven filters (?accountId=&categoryId=&status=) rather than
// component state — a filtered URL is shareable/bookmarkable and
// survives a refresh, and the actual filtering happens server-side in
// page.tsx via listTransactions, so this component only ever navigates.
export function TransactionFilters({
  accounts,
  categories,
}: {
  accounts: AccountOption[];
  categories: CategoryOption[];
}) {
  const t = useTranslations("Transactions");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
      <FilterSelect
        value={searchParams.get("accountId") ?? ""}
        onChange={(v) => update("accountId", v)}
        placeholder={t("filterAccount")}
        options={accounts.map((a) => ({ value: a.id, label: a.nickname }))}
      />
      <FilterSelect
        value={searchParams.get("categoryId") ?? ""}
        onChange={(v) => update("categoryId", v)}
        placeholder={t("filterCategory")}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
      <FilterSelect
        value={searchParams.get("status") ?? ""}
        onChange={(v) => update("status", v)}
        placeholder={t("filterStatus")}
        options={[
          { value: "actual", label: t("statusActual") },
          { value: "planned", label: t("statusPlanned") },
        ]}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`cursor-pointer appearance-none rounded-full border py-2 pl-4 pr-9 text-sm font-medium outline-none transition-colors ${
          value
            ? "border-transparent bg-primary text-on-primary"
            : "border-border bg-surface text-foreground"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        className={`pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${value ? "text-on-primary" : "text-muted"}`}
      />
    </div>
  );
}
