/* ShadcnUI */
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes renders an inline script that sets the theme class on <html>
 * before first paint, so the provider has to be in the server HTML: gating it
 * behind a mount check left the page painting light until hydration.
 *
 * The script only ever runs from the server HTML. On the client React never
 * executes it, but React 19 logs a dev error for any executable <script> a
 * component renders, so the client copy is typed as inert text. next-themes
 * marks the tag `suppressHydrationWarning`, which covers the differing `type`.
 */
const scriptProps = {
  type: typeof window === "undefined" ? "text/javascript" : "text/plain",
};

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider scriptProps={scriptProps} {...props}>
      {children}
    </NextThemesProvider>
  );
}
