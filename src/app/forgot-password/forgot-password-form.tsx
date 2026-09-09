"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { MailIcon, CheckIcon } from "@/components/icons";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const t = useTranslations("ForgotPassword");
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-primary-light p-6 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-on-accent">
          <CheckIcon className="h-5 w-5" />
        </span>
        <p className="text-sm text-foreground/80">{t("checkEmail")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
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
            aria-invalid={state.fieldErrors?.email ? true : undefined}
            className="w-full rounded-2xl border border-transparent bg-primary-light py-4 pl-12 pr-4 text-foreground transition-colors focus:border-primary focus:outline-none"
          />
        </div>
        {state.fieldErrors?.email && (
          <p className="text-xs text-error">{t("errors.invalidEmail")}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-primary py-4 font-medium text-on-primary shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? t("sending") : t("send")}
      </button>
    </form>
  );
}
