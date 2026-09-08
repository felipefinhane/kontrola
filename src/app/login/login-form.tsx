"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { MailIcon, LockIcon } from "@/components/icons";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const t = useTranslations("Login");
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="ml-1 text-sm font-medium">
          {t("emailLabel")}
        </label>
        <div className="relative">
          <MailIcon className="pointer-events-none absolute inset-y-0 left-4 my-auto h-5 w-5 text-muted" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-xl border border-transparent bg-primary-light py-3 pl-12 pr-4 text-foreground placeholder-muted transition-colors focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="ml-1 text-sm font-medium">
            {t("passwordLabel")}
          </label>
          {/* Screen exists (docs/stitch-export/03b-forgot-password.html)
              but the flow is deferred (#16 — needs an email provider
              decision). Link stays, matching the design, 404s for now. */}
          <Link href="/forgot-password" className="text-xs text-primary">
            {t("forgotPassword")}
          </Link>
        </div>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute inset-y-0 left-4 my-auto h-5 w-5 text-muted" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            className="w-full rounded-xl border border-transparent bg-primary-light py-3 pl-12 pr-4 text-foreground placeholder-muted transition-colors focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-center text-sm text-error">
          {t(`errors.${state.error}`)}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-medium text-on-primary shadow-sm transition-transform active:scale-95 disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
