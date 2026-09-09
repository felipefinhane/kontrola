"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = {
  error?: "invalidCredentials";
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    // Same pattern as src/app/signup/actions.ts: only AuthError (thrown
    // when authorize() in src/auth.ts returns null) is a real failure
    // here — success throws Next.js's redirect signal, which must
    // propagate, not get caught. Deliberately one generic message either
    // way (no user found vs. wrong password) — don't help an attacker
    // enumerate which emails have accounts.
    await signIn("credentials", { email, password, redirectTo: "/home" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "invalidCredentials" };
    }
    throw err;
  }

  return {};
}
