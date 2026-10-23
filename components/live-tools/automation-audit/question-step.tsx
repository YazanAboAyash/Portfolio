/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import type { AuditOptionId } from "@/types/live-tools/automation-audit";

interface QuestionOption {
  id: AuditOptionId;
  text: string;
}

interface QuestionStepProps {
  questionNumber: number;
  questionLabel: string;
  options: QuestionOption[];
  selectedAnswer: AuditOptionId | undefined;
  onSelect: (option: AuditOptionId) => void;
}

export function QuestionStep({
  questionNumber,
  questionLabel,
  options,
  selectedAnswer,
  onSelect,
}: QuestionStepProps) {
  const t = useTranslations("LiveTools.audit");

  return (
    <fieldset className="w-full">
      <legend className="text-lg font-semibold text-foreground mb-6 leading-snug">
        <span className="text-muted-foreground text-sm font-normal block mb-1">
          {t("question")} {questionNumber}
        </span>
        {questionLabel}
      </legend>

      <div className="space-y-3" role="radiogroup" aria-label={questionLabel}>
        {options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(option.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent/30"
                }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`shrink-0 h-4 w-4 rounded-full border-2 transition-colors
                    ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`}
                  aria-hidden="true"
                />
                {option.text}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
