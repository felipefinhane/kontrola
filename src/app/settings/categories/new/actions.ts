"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createCategory, listCategories } from "@/db/queries/categories";

export type AddCategoryState = {
  fieldErrors?: {
    name?: "required" | "duplicate";
  };
};

export async function addCategory(
  _prevState: AddCategoryState,
  formData: FormData,
): Promise<AddCategoryState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { fieldErrors: { name: "required" } };
  }

  // Case-insensitive check against every category this user can already
  // see (system defaults + their own) — avoids a confusing "Health" next
  // to "health" rather than enforcing it with a DB constraint, since
  // schema.ts deliberately has no unique index on (name): a system
  // default's name isn't unique by schema, just by convention (same
  // reasoning as src/db/seed.ts's own idempotency check).
  const existing = await listCategories(session.user.id);
  const isDuplicate = existing.some(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  );
  if (isDuplicate) {
    return { fieldErrors: { name: "duplicate" } };
  }

  await createCategory(session.user.id, name);

  redirect("/settings/categories");
}
