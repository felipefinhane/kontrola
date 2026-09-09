"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import {
  consumePasswordResetToken,
  verifyPasswordResetToken,
} from "@/db/queries/password-reset";
import { isPasswordStrong } from "@/lib/validation";

// Same cost factor as #2/#14 — every place a password_hash gets produced.
const BCRYPT_SALT_ROUNDS = 12;

export type ResetPasswordState = {
  fieldErrors?: {
    newPassword?: "weak";
    confirmPassword?: "mismatch";
  };
  error?: "invalidToken";
};

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!isPasswordStrong(newPassword)) {
    return { fieldErrors: { newPassword: "weak" } };
  }
  if (newPassword !== confirmPassword) {
    return { fieldErrors: { confirmPassword: "mismatch" } };
  }

  // Re-verify here too, not just on page load (src/app/reset-password/
  // page.tsx) — the token could expire, or get used from another tab,
  // between when the page rendered and this submit.
  const valid = await verifyPasswordResetToken(token);
  if (!valid) {
    return { error: "invalidToken" };
  }

  const newHash = await hash(newPassword, BCRYPT_SALT_ROUNDS);
  const result = await consumePasswordResetToken(token, newHash);
  if (!result) {
    return { error: "invalidToken" };
  }

  redirect("/login");
}
