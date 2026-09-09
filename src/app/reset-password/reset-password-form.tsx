"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { LockIcon } from "@/components/icons";
import { resetPassword, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("ResetPassword");
  const [state, formAction, pending] = useActionState(
    resetPassword,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-medium">
          {t("newPasswordLabel")}
        </label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute inset-y-0 left-4 my-auto h-5 w-5 text-muted" />
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            aria-invalid={state.fieldErrors?.newPassword ? true : undefined}
            className="w-full rounded-xl border border-transparent bg-primary-light py-3 pl-12 pr-4 text-foreground transition-colors focus:border-primary focus:outline-none"
          />
        </div>
        <p
          className={`ml-1 text-xs ${state.fieldErrors?.newPassword ? "text-error" : "text-muted"}`}
        >
          {state.fieldErrors?.newPassword
            ? t("errors.weak")
            : t("newPasswordHint")}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute inset-y-0 left-4 my-auto h-5 w-5 text-muted" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            aria-invalid={state.fieldErrors?.confirmPassword ? true : undefined}
            className="w-full rounded-xl border border-transparent bg-primary-light py-3 pl-12 pr-4 text-foreground transition-colors focus:border-primary focus:outline-none"
          />
        </div>
        {state.fieldErrors?.confirmPassword && (
          <p className="ml-1 text-xs text-error">{t("errors.mismatch")}</p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="text-center text-sm text-error">
          {t("errors.invalidToken")}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-primary py-4 font-medium text-on-primary shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? t("saving") : t("save")}
      </button>
    </form>
  );
}
