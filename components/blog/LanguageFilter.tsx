/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  BLOG_LANGUAGE_NAMES,
  SUPPORTED_BLOG_LANGUAGES,
  type BlogLanguage,
} from "@/types/hubs/blogs";

interface LanguageFilterProps {
  selectedLanguage?: BlogLanguage | "all";
  onLanguageChange: (language: BlogLanguage | "all") => void;
  className?: string;
}

const option =
  "inline-flex min-h-10 cursor-pointer items-center px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const optionIdle = "bg-surface hover:bg-surface-2";
const optionActive = "bg-primary text-primary-foreground";

export function LanguageFilter({
  selectedLanguage = "all",
  onLanguageChange,
  className = "",
}: LanguageFilterProps) {
  const options: (BlogLanguage | "all")[] = ["all", ...SUPPORTED_BLOG_LANGUAGES];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((lang) => (
        <button
          key={lang}
          type="button"
          aria-pressed={selectedLanguage === lang}
          onClick={() => onLanguageChange(lang)}
          className={cn(
            option,
            selectedLanguage === lang ? optionActive : optionIdle,
          )}
        >
          {lang === "all" ? "All Languages" : BLOG_LANGUAGE_NAMES[lang]}
        </button>
      ))}
    </div>
  );
}
