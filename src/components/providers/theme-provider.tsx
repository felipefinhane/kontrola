"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// Backs the Settings screen's Light / Dark / System control (see
// CONTEXT.md decision log and docs/stitch-export/14-settings.html).
// next-themes toggles the `.dark` class on <html>, which globals.css
// keys its dark-mode tokens off via @custom-variant dark.
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
