"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertIcon } from "@/components/icons";

// iOS Safari doesn't expose Web Push to a page running in a regular
// browser tab — only to one installed as a Home Screen PWA. Detecting
// "installed" is a client-only browser check (`navigator.standalone`,
// the iOS-specific flag — no cross-platform API for this), so this
// banner can only ever decide what to show after mount.
export function IosInstallBanner() {
  const t = useTranslations("Notifications");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const nav = navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      nav.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only UA/display-mode probe, not a derived/cascading update
    setShow(isIOS && !isStandalone);
  }, []);

  if (!show) return null;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-primary/10 bg-primary-light p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-debit shadow-sm">
          <AlertIcon className="h-4 w-4" />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-primary">{t("iosTitle")}</h3>
          <p className="text-sm text-foreground/80">{t("iosDescription")}</p>
        </div>
      </div>
    </section>
  );
}
