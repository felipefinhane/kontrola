import { eq } from "drizzle-orm";
import { withUserContext } from "@/db";
import { users } from "@/db/schema";

// Same discipline as every other query module: withUserContext only.
// users_update_self_only (schema.ts) already restricts an update to the
// caller's own row, but going through withUserContext keeps the pattern
// uniform rather than special-casing "well, this table also allows a
// plain db call" beyond the two auth exceptions src/auth.ts documents.

export type UserPreferences = {
  email: string;
  locale: string;
  theme: string;
  defaultCurrency: string;
  // numeric(3,0) in schema.ts -> drizzle returns it as a string like every
  // other numeric column in this app (see accounts.ts's `amount`) — parsed
  // here so callers get a real number, matching what #15's stepper needs.
  inactivityReminderDays: number;
};

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferences | null> {
  return withUserContext(userId, async (tx) => {
    const [user] = await tx
      .select({
        email: users.email,
        locale: users.locale,
        theme: users.theme,
        defaultCurrency: users.defaultCurrency,
        inactivityReminderDays: users.inactivityReminderDays,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) return null;
    return {
      ...user,
      inactivityReminderDays: Number(user.inactivityReminderDays),
    };
  });
}

export type UserPreferencesInput = Partial<{
  locale: string;
  theme: string;
  defaultCurrency: string;
  inactivityReminderDays: number;
}>;

export async function updateUserPreferences(
  userId: string,
  input: UserPreferencesInput,
) {
  return withUserContext(userId, async (tx) => {
    const { inactivityReminderDays, ...rest } = input;
    const [user] = await tx
      .update(users)
      .set({
        ...rest,
        // numeric columns take a string on the way in too (again, same
        // as `amount` elsewhere) — undefined here just means "don't
        // change this column," matching Partial's semantics for `rest`.
        ...(inactivityReminderDays !== undefined
          ? { inactivityReminderDays: String(inactivityReminderDays) }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        locale: users.locale,
        theme: users.theme,
        defaultCurrency: users.defaultCurrency,
        inactivityReminderDays: users.inactivityReminderDays,
      });
    return user ?? null;
  });
}

// #14 Change Password. Separate from getUserPreferences — passwordHash
// has no business being fetched by anything that isn't verifying it.
export async function getPasswordHash(userId: string): Promise<string | null> {
  return withUserContext(userId, async (tx) => {
    const [user] = await tx
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user?.passwordHash ?? null;
  });
}

export async function updatePasswordHash(userId: string, passwordHash: string) {
  return withUserContext(userId, (tx) =>
    tx
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId)),
  );
}
