"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// `new Uint8Array(n)` (not `.from()`) so TS infers a real ArrayBuffer
// backing store, not the wider ArrayBufferLike (which includes
// SharedArrayBuffer) `pushManager.subscribe`'s `applicationServerKey`
// won't accept.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const bytes = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }
  return bytes;
}

type Status = "checking" | "unsupported" | "subscribed" | "unsubscribed";

// Registers public/sw.js and manages THIS browser/device's own Push
// subscription — CONTEXT.md's PushSubscription is per-device, not
// per-User, so "is push on" can only ever be answered by asking this
// browser's own pushManager, never the server (which just knows the
// User has *some* subscriptions, not whether this one is among them).
export function PushToggle({ vapidPublicKey }: { vapidPublicKey: string }) {
  const t = useTranslations("Notifications");
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.getSubscription();
      setStatus(subscription ? "subscribed" : "unsubscribed");
    }
    check().catch(() => setStatus("unsupported"));
  }, []);

  async function subscribe() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      await fetch("/api/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      setStatus("subscribed");
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push-subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus("unsubscribed");
    } finally {
      setBusy(false);
    }
  }

  if (status === "unsupported") {
    return <p className="text-sm text-muted">{t("unsupported")}</p>;
  }

  const checked = status === "subscribed";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={t("enableTitle")}
      disabled={busy || status === "checking"}
      onClick={() => (checked ? unsubscribe() : subscribe())}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
        checked ? "bg-accent" : "bg-surface-variant"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
