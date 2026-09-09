import { and, eq } from "drizzle-orm";
import { withUserContext } from "@/db";
import { pushSubscriptions } from "@/db/schema";

// Same discipline as every other query module: withUserContext only.
// push_subscriptions_owner_only (schema.ts) scopes everything to
// app.user_id already.

export type PushSubscriptionInput = {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
};

// One User can have several rows (CONTEXT.md: "installing the PWA on a
// second device creates another PushSubscription, it doesn't replace the
// first") — `endpoint` uniquely identifies one browser/device's
// registration, so upserting on it handles both "first subscribe" and
// "the browser silently rotated its endpoint/keys and resubscribed"
// (a real thing push services do) without creating a duplicate row.
export async function upsertPushSubscription(
  userId: string,
  input: PushSubscriptionInput,
) {
  return withUserContext(userId, async (tx) => {
    const [row] = await tx
      .insert(pushSubscriptions)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          userId,
          p256dhKey: input.p256dhKey,
          authKey: input.authKey,
        },
      })
      .returning();
    return row;
  });
}

export async function deletePushSubscription(userId: string, endpoint: string) {
  return withUserContext(userId, (tx) =>
    tx
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, endpoint),
        ),
      ),
  );
}
