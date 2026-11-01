/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { z } from "zod";
import { SUPPORTED_LOCALES } from "@/data/configs/i18n";
import {
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_MESSAGE_MIN,
  FEEDBACK_NAME_MAX,
  FEEDBACK_NAME_MIN,
  FEEDBACK_TOPICS,
} from "@/data/configs/feedback";

/**
 * Feedback is published, so a link in it would be a link on this site. Nothing
 * a visitor has to say about Yazan or the site needs one.
 */
const LINK_PATTERN = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|top|info)\b/i;

/**
 * One schema for both ends: the form validates with it through `zodResolver`,
 * and `POST /api/feedback` validates the same object again, because nothing the
 * browser checked can be trusted. Messages are translation keys under
 * `Feedback.errors`, never prose.
 */
export const feedbackSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(FEEDBACK_NAME_MAX, "nameLength")
      .refine(
        (value) => value === "" || value.length >= FEEDBACK_NAME_MIN,
        "nameLength",
      )
      // Letters from any script, plus the spaces, dots, apostrophes and hyphens
      // real names use. Digits and symbols are how handles and links get in.
      .refine(
        (value) => value === "" || /^[\p{L}\p{M}\s.'-]+$/u.test(value),
        "nameChars",
      ),
    topic: z.enum(FEEDBACK_TOPICS),
    rating: z.number().int().min(1).max(5).nullable(),
    message: z
      .string()
      .trim()
      .min(FEEDBACK_MESSAGE_MIN, "messageShort")
      .max(FEEDBACK_MESSAGE_MAX, "messageLong")
      .refine((value) => !LINK_PATTERN.test(value), "messageLinks"),
    consentToPublish: z.boolean(),
    locale: z.enum(SUPPORTED_LOCALES),
    // Honeypot: hidden from people, filled in by form-stuffing bots. Allowed to
    // be anything here so the server can answer a bot with a fake success
    // instead of a validation error that tells it what tripped.
    website: z.string().max(200),
    // When the form mounted. Caller-supplied, so it only stops naive bots.
    startedAt: z.number().int().nonnegative(),
  })
  .strict();
