import { randomBytes, createHash } from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, withUserContext } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";

// Token creation/verification use plain `db`, not withUserContext — same
// reasoning as src/auth.ts's login lookup and #2 Sign Up's insert: this
// flow runs before any session exists, so there's no app.user_id to
// scope by yet. schema.ts's password_reset_tokens_* policies (ADR-0012)
// allow these on their own. consumePasswordResetToken is the exception —
// see its own comment for why it needs withUserContext after all.

const TOKEN_BYTES = 32;
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

// Returns null if no account matches this email — the caller (#16's
// forgot-password action) shows the same generic message either way, so
// a null here isn't a special case for the user, only for whether an
// email actually gets sent.
export async function createPasswordResetToken(
  email: string,
): Promise<{ rawToken: string; userId: string } | null> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  if (!user) return null;

  const rawToken = randomBytes(TOKEN_BYTES).toString("base64url");
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + EXPIRY_MS),
  });

  return { rawToken, userId: user.id };
}

// Verifies without consuming — #16's reset-password page calls this on
// load to decide whether to show the form or an "expired/invalid" state,
// separately from actually spending the token on submit.
export async function verifyPasswordResetToken(
  rawToken: string,
): Promise<{ userId: string } | null> {
  const [row] = await db
    .select({ userId: passwordResetTokens.userId })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(rawToken)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return row ?? null;
}

// Marks the token used AND updates the password. Two separate steps, NOT
// one bare db.transaction() — found the hard way (see docs/TASKS.md #16):
// schema.ts's users_update_self_only policy requires app.user_id = the
// target row's id, and a plain `db` call never sets that (no session
// exists in this flow), so the UPDATE on `users` silently matched zero
// rows under RLS — no error, no thrown exception, `usedAt` still got set
// on the token, everything *looked* like success. The lookup below is
// the only step allowed to run session-less (password_reset_tokens'
// own permissive SELECT policy, ADR-0012); once it's confirmed the
// caller holds a valid, unexpired, unused token for a specific user —
// equivalent proof of being that user, the same trust level a session
// JWT carries — withUserContext(row.userId, ...) is what actually
// satisfies users_update_self_only for the rest.
export async function consumePasswordResetToken(
  rawToken: string,
  newPasswordHash: string,
): Promise<{ userId: string } | null> {
  const [row] = await db
    .select({
      id: passwordResetTokens.id,
      userId: passwordResetTokens.userId,
    })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(rawToken)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!row) return null;

  await withUserContext(row.userId, async (tx) => {
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, row.id));

    await tx
      .update(users)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
      .where(eq(users.id, row.userId));
  });

  return { userId: row.userId };
}
