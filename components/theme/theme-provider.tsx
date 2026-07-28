/* ShadcnUI */
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Never emits a change: the value flips from the server snapshot to the client
// snapshot exactly once, when hydration completes.
const subscribeToNothing = () => () => {};

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const mounted = React.useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
