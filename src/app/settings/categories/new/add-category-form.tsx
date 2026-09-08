"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { TagIcon } from "@/components/icons";
import { addCategory, type AddCategoryState } from "./actions";

const initialState: AddCategoryState = {};

export function AddCategoryForm() {
  const t = useTranslations("AddCategory");
  const [state, formAction, pending] = useActionState(
    addCategory,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-1 flex-col gap-6">
      <p className="text-sm text-foreground/80">{t("subtitle")}</p>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="ml-1 text-sm font-medium">
          {t("nameLabel")}
        </label>
        <div className="relative">
          <TagIcon className="pointer-events-none absolute inset-y-0 left-4 my-auto h-5 w-5 text-muted" />
          <input
            id="name"
            name="name"
            autoFocus
            placeholder={t("namePlaceholder")}
            aria-invalid={state.fieldErrors?.name ? true : undefined}
            className="w-full rounded-xl border border-transparent bg-primary-light py-4 pl-12 pr-4 text-foreground placeholder-muted transition-colors focus:border-primary focus:outline-none"
          />
        </div>
        {state.fieldErrors?.name && (
          <p className="ml-1 text-xs text-error">
            {t(`errors.${state.fieldErrors.name}`)}
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
