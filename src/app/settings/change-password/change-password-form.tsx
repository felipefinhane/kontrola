"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { LockIcon } from "@/components/icons";
import { changePassword, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const t = useTranslations("ChangePassword");
  const [state, formAction, pending] = useActionState(
    changePassword,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-1 flex-col gap-6">
      <p className="text-sm text-foreground/80">{t("subtitle")}</p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="currentPassword" className="ml-1 text-sm font-medium">
          {t("currentPasswordLabel")}
        </label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute inset-y-0 left-4 my-auto h-5 w-5 text-muted" />
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            aria-invalid={state.fieldErrors?.currentPassword ? true : undefined}
            className="w-full rounded-xl border border-transparent bg-primary-light py-3 pl-12 pr-4 text-foreground transition-colors focus:border-primary focus:outline-none"
          />
        </div>
        {state.fieldErrors?.currentPassword && (
          <p className="ml-1 text-xs text-error">
            {t("errors.currentPasswordIncorrect")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className="ml-1 text-sm font-medium">
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
            ? t(`errors.${state.fieldErrors.newPassword}`)
            : t("newPasswordHint")}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="ml-1 text-sm font-medium">
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
          <p className="ml-1 text-xs text-error">
            {t("errors.mismatch")}
          </p>
        )}
      </div>

      <div className="mt-auto pt-4">
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-on-primary shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
