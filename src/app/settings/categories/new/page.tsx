import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeftIcon } from "@/components/icons";
import { AddCategoryForm } from "./add-category-form";

// Add Category — a dedicated page rather than a modal on the Categories
// grid, matching #5 Add Account's pattern (this codebase's only prior
// "create X" flow) rather than introducing a new UI paradigm for one
// screen. Doesn't collect an icon (src/lib/category-icons.ts falls back
// to a generic tag icon for custom categories) — no icon-picker UI
// exists, and the Stitch export's own "Add Category" card doesn't ask
// for one either.
export default async function AddCategoryPage() {
  const t = await getTranslations("AddCategory");

  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-4">
        <Link
          href="/settings/categories"
          aria-label={t("back")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-variant"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-primary">{t("title")}</h1>
        <div className="h-10 w-10" />
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-8">
        <AddCategoryForm />
      </div>
    </main>
  );
}
