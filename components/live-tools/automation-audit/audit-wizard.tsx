/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./progress-bar";
import { QuestionStep } from "./question-step";
import { ScoreDisplay } from "./score-display";
import { Recommendations } from "./recommendations";
import {
  QUESTION_IDS,
  calculateAuditScore,
  getScoreBucket,
} from "@/data/live-tools/automation-audit";
import type {
  AuditAnswers,
  AuditOptionId,
  AuditQuestionId,
  AuditResult,
  AuditScoreBucket,
  AuditApiResponse,
} from "@/types/live-tools/automation-audit";

type Phase = "questions" | "results";

export function AuditWizard() {
  const t = useTranslations("LiveTools.audit");
  const tt = useTranslations("Services");

  const [phase, setPhase] = useState<Phase>("questions");
  const [step, setStep] = useState(0); // 0-indexed, 0–7
  const [answers, setAnswers] = useState<Partial<AuditAnswers>>({});
  const [score, setScore] = useState(0);
  const [bucket, setBucket] = useState<AuditScoreBucket>("medium");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const currentQId = QUESTION_IDS[step] as AuditQuestionId;
  const currentAnswer = answers[currentQId];
  const isLastStep = step === QUESTION_IDS.length - 1;
  const totalSteps = QUESTION_IDS.length;

  // Build translated question data for the current step
  const questionLabel = t(
    `questions.${currentQId}.label` as Parameters<typeof t>[0],
  );
  const options = (["a", "b", "c", "d"] as const).map((opt) => ({
    id: opt as AuditOptionId,
    text: t(`questions.${currentQId}.${opt}` as Parameters<typeof t>[0]),
  }));

  function handleSelect(option: AuditOptionId) {
    setAnswers((prev) => ({ ...prev, [currentQId]: option }));
  }

  function handleNext() {
    if (!currentAnswer) return;
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    const fullAnswers = answers as AuditAnswers;
    const calculatedScore = calculateAuditScore(fullAnswers);
    const calculatedBucket = getScoreBucket(calculatedScore);

    setScore(calculatedScore);
    setBucket(calculatedBucket);
    setPhase("results");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/automation-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: fullAnswers }),
      });

      if (response.status === 429) {
        setRemaining(0);
        setError(t("limitReached"));
        return;
      }

      if (!response.ok) {
        setError(t("errorGeneric"));
        return;
      }

      const data = (await response.json()) as AuditApiResponse;
      setResult(data.result);
      setRemaining(data.remaining);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  function handleRetake() {
    setPhase("questions");
    setStep(0);
    setAnswers({});
    setResult(null);
    setError(null);
    setScore(0);
  }

  return (
    <Card
      className="w-full max-w-2xl mx-auto px-3 py-4 flex flex-col
      bg-background/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="p-8 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("title")}
        </h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="p-8 space-y-8">
        {phase === "questions" ? (
          <>
            <ProgressBar current={step + 1} total={totalSteps} />

            <QuestionStep
              questionNumber={step + 1}
              questionLabel={questionLabel}
              options={options}
              selectedAnswer={currentAnswer}
              onSelect={handleSelect}
            />

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 0}
                className="gap-1.5"
                aria-label={t("back")}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {t("back")}
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!currentAnswer}
                  className="min-w-32"
                >
                  {t("submit")}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="min-w-24"
                >
                  {t("next")}
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <ScoreDisplay score={score} bucket={bucket} />

            {error ? (
              <p
                role="alert"
                className="text-center text-sm text-destructive border border-destructive/30 rounded-lg p-3"
              >
                {error}
              </p>
            ) : (
              <Recommendations
                result={result}
                loading={loading}
                ctaButtonLabel={tt("cta.button")}
              />
            )}

            {remaining !== null && !error && (
              <p className="text-center text-xs text-muted-foreground">
                {t("remaining", { remaining })}
              </p>
            )}

            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={handleRetake}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {t("retake")}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
