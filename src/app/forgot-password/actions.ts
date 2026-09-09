"use server";

import { headers } from "next/headers";
import { createPasswordResetToken } from "@/db/queries/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/validation";

export type ForgotPasswordState = {
  submitted?: boolean;
  fieldErrors?: { email?: "invalid" };
};

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!isValidEmail(email)) {
    return { fieldErrors: { email: "invalid" } };
  }

  const result = await createPasswordResetToken(email);
  if (result) {
    const headersList = await headers();
    const host = headersList.get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const resetUrl = `${protocol}://${host}/reset-password?token=${result.rawToken}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  // Same response whether or not the email has an account — no user
  // enumeration via response difference (#2/#3's same principle),
  // ADR-0012. `result` being null just means no email actually went out.
  return { submitted: true };
}
