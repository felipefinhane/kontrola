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
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user ?? null;
  });
}

export type UserPreferencesInput = Partial<{
  locale: string;
  theme: string;
  defaultCurrency: string;
}>;

export async function updateUserPreferences(
  userId: string,
  input: UserPreferencesInput,
) {
  return withUserContext(userId, async (tx) => {
    const [user] = await tx
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({
        locale: users.locale,
        theme: users.theme,
        defaultCurrency: users.defaultCurrency,
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
