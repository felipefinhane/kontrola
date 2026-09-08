"use client";

import { useActionState, useId, useState } from "react";
import { useTranslations } from "next-intl";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { signUp, type SignUpState } from "./actions";

const initialState: SignUpState = {};

export function SignUpForm() {
  const t = useTranslations("SignUp");
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const emailErrorId = useId();
  const passwordErrorId = useId();

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
            aria-invalid={state.fieldErrors?.email ? true : undefined}
            aria-describedby={
              state.fieldErrors?.email ? emailErrorId : undefined
            }
            className="w-full rounded-xl border border-transparent bg-primary-light py-3 pl-12 pr-4 text-foreground placeholder-muted transition-colors focus:border-primary focus:outline-none"
          />
        </div>
        {state.fieldErrors?.email && (
          <p id={emailErrorId} className="ml-1 text-xs text-error">
            {t(`errors.${state.fieldErrors.email}`)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="ml-1 text-sm font-medium">
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute inset-y-0 left-4 my-auto h-5 w-5 text-muted" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder={t("passwordPlaceholder")}
            aria-invalid={state.fieldErrors?.password ? true : undefined}
            aria-describedby={passwordErrorId}
            className="w-full rounded-xl border border-transparent bg-primary-light py-3 pl-12 pr-12 text-foreground placeholder-muted transition-colors focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={t(showPassword ? "hidePassword" : "showPassword")}
            className="absolute inset-y-0 right-4 my-auto text-muted transition-colors hover:text-primary"
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <p
          id={passwordErrorId}
          className={`ml-1 text-xs ${state.fieldErrors?.password ? "text-error" : "text-muted"}`}
        >
          {state.fieldErrors?.password
            ? t(`errors.${state.fieldErrors.password}`)
            : t("passwordHint")}
        </p>
      </div>

      <div className="mt-1 flex items-center justify-center gap-2">
        <ShieldCheckIcon className="h-4 w-4 text-accent" />
        <span className="text-xs text-foreground/80">{t("trustBadge")}</span>
      </div>

      {state.error && (
        <p role="alert" className="text-center text-sm text-error">
          {t(`errors.${state.error}`)}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-medium text-on-primary shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
