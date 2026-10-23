/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

export type AuditQuestionId =
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7"
  | "q8";

export type AuditOptionId = "a" | "b" | "c" | "d";

export type AuditScoreBucket = "high" | "medium" | "low";

/** Map of question ID → selected option ID */
export type AuditAnswers = Record<AuditQuestionId, AuditOptionId>;

/** Single automation recommendation returned by the AI */
export interface AuditAutomation {
  title: string;
  tool: string;
  timeSaved: string;
}

/** Structured result returned from the API */
export interface AuditResult {
  summary: string;
  topAutomations: AuditAutomation[];
  ctaMessage: string;
}

/** Shape of the POST /api/automation-audit response */
export interface AuditApiResponse {
  result: AuditResult;
  remaining: number;
}
