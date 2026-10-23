/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type {
  AuditQuestionId,
  AuditOptionId,
  AuditAnswers,
  AuditScoreBucket,
} from "@/types/live-tools/automation-audit";

export const MAX_AUDIT_USES_PER_IP = 5;
export const QUESTION_IDS: AuditQuestionId[] = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
];
const OPTIONS: AuditOptionId[] = ["a", "b", "c", "d"];

/**
 * Scoring weights per question option.
 * Higher weight = stronger automation signal.
 */
export const AUDIT_WEIGHTS: Record<
  AuditQuestionId,
  Record<AuditOptionId, number>
> = {
  q1: { a: 1, b: 2, c: 3, d: 4 }, // hours/week
  q2: { a: 1, b: 2, c: 3, d: 4 }, // team size
  q3: { a: 3, b: 3, c: 3, d: 2 }, // bottleneck type (all automation-friendly)
  q4: { a: 1, b: 2, c: 3, d: 4 }, // current tooling maturity
  q5: { a: 1, b: 2, c: 3, d: 4 }, // error frequency
  q6: { a: 3, b: 3, c: 3, d: 2 }, // industry
  q7: { a: 1, b: 2, c: 3, d: 4 }, // budget comfort
  q8: { a: 2, b: 2, c: 3, d: 3 }, // primary goal
};

/** Sum of max possible weights across all questions */
export const MAX_AUDIT_SCORE = QUESTION_IDS.reduce(
  (sum, qid) =>
    sum + Math.max(...OPTIONS.map((opt) => AUDIT_WEIGHTS[qid][opt])),
  0,
); // 4+4+3+4+4+3+4+3 = 29

/** Calculate a 0-100 readiness score from completed answers */
export function calculateAuditScore(answers: AuditAnswers): number {
  const raw = QUESTION_IDS.reduce(
    (sum, qid) => sum + AUDIT_WEIGHTS[qid][answers[qid]],
    0,
  );
  return Math.round((raw / MAX_AUDIT_SCORE) * 100);
}

export function getScoreBucket(score: number): AuditScoreBucket {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * English-language context descriptions used to build the AI prompt.
 * These are NOT displayed to the user — i18n keys handle display text.
 */
export const AUDIT_QUESTION_CONTEXT: Record<
  AuditQuestionId,
  { label: string; options: Record<AuditOptionId, string> }
> = {
  q1: {
    label: "Hours per week on repetitive manual tasks",
    options: {
      a: "Less than 2 hours",
      b: "2-5 hours",
      c: "5-10 hours",
      d: "More than 10 hours",
    },
  },
  q2: {
    label: "Team size",
    options: {
      a: "Solo",
      b: "2-5 people",
      c: "6-20 people",
      d: "More than 20 people",
    },
  },
  q3: {
    label: "Biggest operational bottleneck",
    options: {
      a: "Data entry & reporting",
      b: "Email & communications",
      c: "Approvals & workflows",
      d: "Scheduling & coordination",
    },
  },
  q4: {
    label: "Current tooling maturity",
    options: {
      a: "Mostly spreadsheets & email",
      b: "A few SaaS apps",
      c: "Multiple connected SaaS apps",
      d: "Already have some automation",
    },
  },
  q5: {
    label: "Error frequency from manual work",
    options: {
      a: "Rarely",
      b: "Occasionally",
      c: "Frequently",
      d: "Very often — a real problem",
    },
  },
  q6: {
    label: "Industry",
    options: {
      a: "Consulting & agencies",
      b: "E-commerce & retail",
      c: "Tech & software",
      d: "Other",
    },
  },
  q7: {
    label: "Monthly budget comfort for automation tooling",
    options: {
      a: "Not sure yet",
      b: "Under €500/month",
      c: "€500-€2,000/month",
      d: "€2,000+/month",
    },
  },
  q8: {
    label: "Primary automation goal",
    options: {
      a: "Save time",
      b: "Reduce errors",
      c: "Scale without hiring",
      d: "Cut operational costs",
    },
  },
};

export const AUDIT_SYSTEM_PROMPT = `You are an automation consultant AI for ColdByDefault, a freelance automation specialist.
Based on a prospect's answers to 8 business questions, provide personalised, specific automation recommendations.

CRITICAL: Return valid JSON only. No markdown fences, no extra text, no trailing commas.

Required JSON structure:
{
  "summary": "2-3 sentence personalised assessment of their situation and automation potential",
  "topAutomations": [
    { "title": "Specific automation name", "tool": "Best tool (e.g. Make, n8n, Zapier, custom GPT, Python script)", "timeSaved": "e.g. 3-5 hours/week" },
    { "title": "Specific automation name", "tool": "Best tool", "timeSaved": "e.g. 2-4 hours/week" },
    { "title": "Specific automation name", "tool": "Best tool", "timeSaved": "e.g. 1-2 hours/week" }
  ],
  "ctaMessage": "One personalised sentence encouraging them to book a free call, mentioning their specific bottleneck or goal"
}

Be specific and actionable. Reference their actual bottleneck and goal in the summary. Recommend real tools, not generic ones.`;
