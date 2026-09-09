"use server";

import { auth } from "@/auth";
import { updateUserPreferences } from "@/db/queries/users";

// Same direct-onClick-invocation, no-redirect pattern as #13's
// updateTheme/updateDefaultCurrency — nothing on this page needs a fresh
// server render just because the stepper moved.
export async function updateInactivityDays(days: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }
  const clamped = Math.min(14, Math.max(1, Math.round(days)));
  await updateUserPreferences(session.user.id, {
    inactivityReminderDays: clamped,
  });
}
