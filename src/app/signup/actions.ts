"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { signIn } from "@/auth";
import { isPasswordStrong, isValidEmail } from "@/lib/validation";

// Cost factor for bcryptjs' hash() — src/auth.ts's login path only ever
// calls compare(), this is the one place that produces a password_hash.
const BCRYPT_SALT_ROUNDS = 12;

export type SignUpState = {
  error?: "signInFailed";
  fieldErrors?: {
    email?: "invalidEmail" | "emailTaken";
    password?: "weakPassword";
  };
};

// drizzle-orm wraps the underlying pg error in its own DrizzleQueryError
// rather than exposing pg's `.code` directly — the real Postgres error
// (with `.code`) lives one level down, under `.cause`. Verified against
// a live duplicate-email insert (see docs/TASKS.md #3): the outer error
// has no `.code` of its own at all, only `.cause.code`.
function isUniqueViolation(err: unknown): boolean {
  const pgCode = (err as { cause?: { code?: unknown } } | null)?.cause?.code;
  return pgCode === "23505";
}

export async function signUp(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) {
    return { fieldErrors: { email: "invalidEmail" } };
  }
  if (!isPasswordStrong(password)) {
    return { fieldErrors: { password: "weakPassword" } };
  }

  const passwordHash = await hash(password, BCRYPT_SALT_ROUNDS);

  try {
    // Plain `db`, not withUserContext — same reasoning as the login
    // lookup in src/auth.ts: there's no session yet to scope by.
    // schema.ts's users_insert_for_signup policy allows this insert on
    // its own.
    await db.insert(users).values({ email, passwordHash });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { fieldErrors: { email: "emailTaken" } };
    }
    throw err;
  }

  try {
    // Re-runs the Credentials provider's authorize() against the row we
    // just inserted rather than trusting our own hash — one code path
    // for "these credentials are valid," not two. On success this
    // throws Next.js's redirect signal, which must NOT be caught below
    // (only AuthError is a real failure here).
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "signInFailed" };
    }
    throw err;
  }

  return {};
}
