/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { z } from "zod";
import type {
  FEEDBACK_STATUSES,
  FEEDBACK_TOPICS,
  MODERATION_VERDICTS,
} from "@/data/configs/feedback";
import type { feedbackSchema } from "@/lib/feedback/schema";

export type FeedbackTopic = (typeof FEEDBACK_TOPICS)[number];

/**
 * `pending` until the owner approves an entry by hand; the AI moderator can
 * only ever move an entry to `rejected`, never to `approved`.
 */
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export type ModerationVerdict = (typeof MODERATION_VERDICTS)[number];

/** What the visitor's browser sends to `POST /api/feedback`. */
export type FeedbackInput = z.infer<typeof feedbackSchema>;

/**
 * Failures reach the client as a bare code, as on the chatbot route, so the
 * form can translate them and nothing provider-side leaks into the UI.
 */
export type FeedbackErrorCode =
  | "INVALID_INPUT"
  | "RATE_LIMIT_EXCEEDED"
  // Distinct from the burst limit: waiting a minute does not help.
  | "DAILY_LIMIT"
  | "DUPLICATE"
  | "SERVICE_UNAVAILABLE";

/**
 * A successful submit. `filed` means the entry was refused (moderator or spam
 * filter) but the visitor is never told so: the form thanks them with a wry
 * note instead of the usual "appears after review".
 */
export interface FeedbackSubmitResponse {
  ok: true;
  outcome: "queued" | "filed";
}

/** One entry on the public wall. Nothing that identifies the sender beyond the name they typed. */
export interface PublicFeedbackEntry {
  id: string;
  name: string | null;
  topic: FeedbackTopic;
  rating: number | null;
  message: string;
  createdAt: string;
}

export interface FeedbackListResponse {
  entries: PublicFeedbackEntry[];
}

/**
 * One entry as the admin review page sees it: everything except the IP and
 * content hashes, which only the submit route needs.
 */
export interface AdminFeedbackEntry extends PublicFeedbackEntry {
  locale: string;
  consentToPublish: boolean;
  status: FeedbackStatus;
  aiVerdict: ModerationVerdict | null;
  aiReasons: string[];
  aiFlaggedTerms: string[];
  reviewedAt: string | null;
}

/** Filters on the admin review page. */
export interface FeedbackAdminFilters {
  status: FeedbackStatus | "all";
  topic: FeedbackTopic | "all";
  search: string;
}

export interface AdminFeedbackListResponse {
  entries: AdminFeedbackEntry[];
  total: number;
  hasMore: boolean;
  /** Per-status totals for the filter tabs, regardless of the active filter. */
  counts: Record<FeedbackStatus, number>;
}

/**
 * The moderator's decision. `null` in place of this means the moderator could
 * not be reached, and the entry waits for review like any other.
 */
export interface ModerationResult {
  verdict: ModerationVerdict;
  reasons: string[];
  /** Offending words exactly as written in the name or message, for highlighting. */
  flaggedTerms: string[];
}
