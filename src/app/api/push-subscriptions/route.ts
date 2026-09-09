import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  upsertPushSubscription,
  deletePushSubscription,
} from "@/db/queries/push-subscriptions";

// #15: the client-side subscribe/unsubscribe flow (src/app/settings/
// notifications/push-toggle.tsx) POSTs/DELETEs here with the browser's
// own PushSubscription.toJSON() shape — an API route, not a Server
// Action, because the payload originates from a browser API call, not a
// form. Sending the actual pushes is separate (ADR-0010, not built yet)
// — this only ever registers/deregisters where they'd go.
//
// Note: src/proxy.ts's default-deny still applies here. An
// unauthenticated request gets proxy.ts's redirect-to-/login before
// this file's own auth() check ever runs (a 30x, not the 401 below) —
// acceptable since this route is only ever called from the already-
// authenticated Notification Settings page, flagged as a known
// trade-off in proxy.ts's own comment already.

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;
  const p256dhKey = body?.keys?.p256dh;
  const authKey = body?.keys?.auth;

  if (
    typeof endpoint !== "string" ||
    typeof p256dhKey !== "string" ||
    typeof authKey !== "string"
  ) {
    return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
  }

  await upsertPushSubscription(session.user.id, {
    endpoint,
    p256dhKey,
    authKey,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;
  if (typeof endpoint !== "string") {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  await deletePushSubscription(session.user.id, endpoint);
  return NextResponse.json({ ok: true });
}
