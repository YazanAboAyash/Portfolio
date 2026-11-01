/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

/** The home page's feedback section; the navbar and footer links land here. */
export const feedbackSectionHref = "/#feedback";

/** What a visitor can leave feedback about. Stored as a plain string in `Feedback.topic`. */
export const FEEDBACK_TOPICS = ["me", "website"] as const;

export const FEEDBACK_STATUSES = ["pending", "approved", "rejected"] as const;

export const MODERATION_VERDICTS = ["approve", "review", "reject"] as const;

export const FEEDBACK_NAME_MIN = 2;
export const FEEDBACK_NAME_MAX = 40;
export const FEEDBACK_MESSAGE_MIN = 10;
export const FEEDBACK_MESSAGE_MAX = 600;

/** A valid submission is a few hundred bytes; anything past this is not one. */
export const FEEDBACK_MAX_BODY_BYTES = 4 * 1024;

/** Submissions faster than this after the form mounted are taken to be bots. */
export const FEEDBACK_MIN_FILL_MS = 3000;

/** Burst limit per IP, in memory and per instance. */
export const FEEDBACK_BURST_WINDOW_MS = 10 * 60 * 1000;
export const FEEDBACK_BURST_MAX = 3;

/** Daily limit per IP, counted in the database so it holds across instances. */
export const FEEDBACK_DAILY_MAX = 3;

/** Ceiling on each moderation call; past it the entry waits for review instead. */
export const FEEDBACK_MODERATION_TIMEOUT_MS = 6000;

/** Entries shown on the home page wall, newest first. */
export const FEEDBACK_WALL_SIZE = 12;

/** Cache tag on the wall query; admin changes clear it so they show at once. */
export const FEEDBACK_WALL_CACHE_TAG = "feedback-wall";

/** Entries per page on the admin review page. */
export const FEEDBACK_ADMIN_PAGE_SIZE = 20;
