/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

/**
 * One click between light and dark. The icons swap on the `dark` class rather
 * than on `resolvedTheme`, so the server render and the first client render
 * agree before next-themes has read the stored choice.
 */
export function ModeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("Navigation");

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={t("toggleTheme")}
      title={t("toggleTheme")}
      className={`relative inline-flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${className}`}
    >
      <Sun
        className="h-[1.15rem] w-[1.15rem] scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90"
        aria-hidden="true"
      />
      <Moon
        className="absolute h-[1.15rem] w-[1.15rem] scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0"
        aria-hidden="true"
      />
    </button>
  );
}
