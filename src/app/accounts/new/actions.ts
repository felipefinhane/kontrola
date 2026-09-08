"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { createAccount } from "@/db/queries/accounts";
import { isSupportedCurrency } from "@/lib/currency";

export type AddAccountState = {
  fieldErrors?: {
    nickname?: "required";
    currency?: "invalid";
    openingBalance?: "invalid";
  };
};

export async function addAccount(
  _prevState: AddAccountState,
  formData: FormData,
): Promise<AddAccountState> {
  // Server Actions guides: "Always verify authentication ... even if the
  // form is only rendered on an authenticated page" — src/proxy.ts (#4)
  // already blocks anonymous navigation to this route, but this action
  // is its own entry point and gets checked on its own terms too.
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const nickname = String(formData.get("nickname") ?? "").trim();
  const bankNameRaw = String(formData.get("bankName") ?? "").trim();
  const currency = String(formData.get("currency") ?? "");
  const balanceRaw = String(formData.get("openingBalance") ?? "").trim();

  if (!nickname) {
    return { fieldErrors: { nickname: "required" } };
  }
  if (!isSupportedCurrency(currency)) {
    return { fieldErrors: { currency: "invalid" } };
  }

  // Empty input means "start empty" (0), same as a literal "0" — both
  // skip the seed Transaction in createAccount. Anything else must be a
  // non-negative number; the input only ever contains digits and "." by
  // construction (client-side stripping in add-account-form.tsx), but
  // this is the actual boundary, not that stripping.
  const openingBalance = balanceRaw === "" ? 0 : Number(balanceRaw);
  if (!Number.isFinite(openingBalance) || openingBalance < 0) {
    return { fieldErrors: { openingBalance: "invalid" } };
  }

  const t = await getTranslations("AddAccount");

  await createAccount(session.user.id, {
    nickname,
    bankName: bankNameRaw || null,
    currency,
    openingBalance,
    openingBalanceDescription: t("openingBalanceTransactionLabel"),
  });

  // /accounts (the Accounts List, #6) doesn't exist yet — same
  // "link/redirect to a route a later task builds" pattern as #1-#4.
  redirect("/accounts");
}
