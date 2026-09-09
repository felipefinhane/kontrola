"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPasswordHash, updatePasswordHash } from "@/db/queries/users";
import { isPasswordStrong } from "@/lib/validation";

// Same cost factor as #2 Sign Up's signUp action — the only other place
// that produces a password_hash.
const BCRYPT_SALT_ROUNDS = 12;

export type ChangePasswordState = {
  fieldErrors?: {
    currentPassword?: "incorrect";
    newPassword?: "weak" | "sameAsCurrent";
    confirmPassword?: "mismatch";
  };
};

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const currentHash = await getPasswordHash(session.user.id);
  if (!currentHash || !(await compare(currentPassword, currentHash))) {
    return { fieldErrors: { currentPassword: "incorrect" } };
  }

  if (!isPasswordStrong(newPassword)) {
    return { fieldErrors: { newPassword: "weak" } };
  }

  if (newPassword !== confirmPassword) {
    return { fieldErrors: { confirmPassword: "mismatch" } };
  }

  // Not a hard requirement anywhere, but a same-as-current "change"
  // silently succeeding would be a confusing no-op from the user's side.
  if (await compare(newPassword, currentHash)) {
    return { fieldErrors: { newPassword: "sameAsCurrent" } };
  }

  const newHash = await hash(newPassword, BCRYPT_SALT_ROUNDS);
  await updatePasswordHash(session.user.id, newHash);

  redirect("/settings");
}
