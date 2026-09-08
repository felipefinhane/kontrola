"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  HomeIcon,
  ReceiptIcon,
  WalletIcon,
  CalendarIcon,
  SettingsIcon,
} from "@/components/icons";

// Shared bottom tab bar — every authenticated, non-transactional screen
// gets this (the Stitch exports' "Semantic Shell Mandate": transactional
// screens like #2 Sign Up/#5 Add Account suppress it, everything else
// shows it). #6 Accounts List is the first screen to need it, so the
// route contract for the other 4 tabs is fixed here even though most of
// them don't exist yet — same forward-link pattern as #1-#6:
//   home     -> /home        (#12 Home Dashboard)
//   history  -> /transactions (#10 Transactions List)
//   accounts -> /accounts     (#6, this task)
//   planned  -> /planned      (#11 Planned view)
//   settings -> /settings     (#13 Settings)
// A screen built against a different path than what's listed here needs
// this file updated to match, not the other way around.
const TABS = [
  { key: "home", href: "/home", Icon: HomeIcon },
  { key: "history", href: "/transactions", Icon: ReceiptIcon },
  { key: "accounts", href: "/accounts", Icon: WalletIcon },
  { key: "planned", href: "/planned", Icon: CalendarIcon },
  { key: "settings", href: "/settings", Icon: SettingsIcon },
] as const;

export function BottomNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed bottom-0 left-0 z-50 flex w-full items-center justify-around bg-surface px-4 pb-2 pt-2 shadow-[0_-4px_20px_rgba(2,36,72,0.06)]">
      {TABS.map(({ key, href, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={key}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-colors ${
              isActive
                ? "bg-accent/10 text-accent"
                : "text-muted hover:bg-surface-variant"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
