import type { ComponentType } from "react";
import {
  HomeIcon,
  FoodIcon,
  CarIcon,
  HeartIcon,
  SchoolIcon,
  RepeatIcon,
  BanknoteIcon,
  SwapIcon,
  TagIcon,
} from "@/components/icons";

// schema.ts's categories.icon stores a Material Symbols icon name (that's
// what src/db/seed.ts writes for the 9 defaults) — but this app never
// wired up the Material Symbols font (#1's call: hand-rolled SVGs only,
// see src/components/icons.tsx), so this maps those known strings to our
// own icon set. A custom category (#8's create flow) doesn't collect an
// icon at all — TagIcon covers both "no icon" and any name we don't
// recognize.
const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  home: HomeIcon,
  restaurant: FoodIcon,
  directions_car: CarIcon,
  favorite: HeartIcon,
  school: SchoolIcon,
  subscriptions: RepeatIcon,
  payments: BanknoteIcon,
  swap_horiz: SwapIcon,
  category: TagIcon,
};

export function getCategoryIcon(
  icon: string | null,
): ComponentType<{ className?: string }> {
  return (icon && CATEGORY_ICONS[icon]) || TagIcon;
}
