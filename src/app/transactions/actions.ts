"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createTransaction,
  updateTransaction,
  confirmTransaction,
  type TransactionInput,
} from "@/db/queries/transactions";

export type TransactionFormState = {
  fieldErrors?: {
    description?: "required";
    accountId?: "required";
    amount?: "invalid";
    occurredOn?: "invalid";
  };
};

function parseTransactionForm(
  formData: FormData,
):
  | { input: TransactionInput; fieldErrors?: never }
  | {
      input?: never;
      fieldErrors: NonNullable<TransactionFormState["fieldErrors"]>;
    } {
  const description = String(formData.get("description") ?? "").trim();
  const accountId = String(formData.get("accountId") ?? "");
  const categoryIdRaw = String(formData.get("categoryId") ?? "");
  const direction =
    formData.get("direction") === "credit" ? "credit" : "debit";
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const occurredOn = String(formData.get("occurredOn") ?? "");
  const status = formData.get("status") === "planned" ? "planned" : undefined;

  const fieldErrors: NonNullable<TransactionFormState["fieldErrors"]> = {};
  if (!description) fieldErrors.description = "required";
  if (!accountId) fieldErrors.accountId = "required";

  const amount = Number(amountRaw);
  if (!amountRaw || !Number.isFinite(amount) || amount <= 0) {
    fieldErrors.amount = "invalid";
  }

  // occurredOn comes from <input type="date">, always YYYY-MM-DD when
  // present — Date.parse also accepts plenty of other formats, but a
  // strict shape check here is the actual boundary, not the input type.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) {
    fieldErrors.occurredOn = "invalid";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    input: {
      accountId,
      categoryId: categoryIdRaw || null,
      description,
      amount,
      direction,
      occurredOn,
      status,
    },
  };
}

// `returnTo` must be an app-relative path (starts with "/", not "//" —
// that's protocol-relative, an open-redirect vector) — otherwise fall
// back to the Account Detail screen. Lets #11's "Add Planned" entry
// point land back on /planned instead of the Account it happened to
// pick, while #7/#9's default (no returnTo at all) still lands on #7.
function safeReturnTo(raw: FormDataEntryValue | null, fallback: string): string {
  const value = String(raw ?? "");
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

// One action for both Add and Edit, distinguished by a hidden
// `transactionId` field rather than `.bind()`-ing it in ahead of
// useActionState — bind() composed with useActionState's own wrapping
// broke the no-JS progressive-enhancement form fallback (the extra bound
// arg and React's own prevState arg collided; verified live, see
// docs/TASKS.md #9). This shape is also just one fewer moving part,
// matching every other action in the app (one function, no currying).
export async function saveTransaction(
  _prevState: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = parseTransactionForm(formData);
  if (parsed.fieldErrors) {
    return { fieldErrors: parsed.fieldErrors };
  }

  const transactionId = String(formData.get("transactionId") ?? "");

  if (transactionId) {
    await updateTransaction(session.user.id, transactionId, parsed.input);
  } else {
    await createTransaction(session.user.id, parsed.input);
  }

  redirect(
    safeReturnTo(
      formData.get("returnTo"),
      `/accounts/${parsed.input.accountId}`,
    ),
  );
}

// CONTEXT.md: confirming a `planned` Transaction flips it to `actual` in
// place. Used by #10/#11's inline "confirm" affordance on a planned row
// — a plain <form> button, not useActionState (no field-level state to
// show, just an action to fire and land back where the user was).
export async function confirmTransactionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const transactionId = String(formData.get("transactionId") ?? "");
  if (transactionId) {
    await confirmTransaction(session.user.id, transactionId);
  }

  redirect(safeReturnTo(formData.get("returnTo"), "/planned"));
}
