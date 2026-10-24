/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LanguageBadge } from "@/components/blog";
import {
  SUPPORTED_BLOG_LANGUAGES,
  type BlogLanguage,
} from "@/types/hubs/blogs";

interface LanguageFilterProps {
  selectedLanguage?: BlogLanguage | "all";
  onLanguageChange: (language: BlogLanguage | "all") => void;
  className?: string;
}

export function LanguageFilter({
  selectedLanguage = "all",
  onLanguageChange,
  className = "",
}: LanguageFilterProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        variant={selectedLanguage === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onLanguageChange("all")}
      >
        All Languages
      </Button>

      {SUPPORTED_BLOG_LANGUAGES.map((lang) => (
        <LanguageBadge
          key={lang}
          language={lang}
          variant={selectedLanguage === lang ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onLanguageChange(lang)}
        />
      ))}
    </div>
  );
}
