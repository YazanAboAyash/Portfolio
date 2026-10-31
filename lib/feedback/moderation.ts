/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { ModerationResult } from "@/types/configs/feedback";
import {
  FEEDBACK_MODERATION_TIMEOUT_MS,
  MODERATION_VERDICTS,
} from "@/data/configs/feedback";
import { FEEDBACK_MODERATION_PROMPT } from "@/data/main/feedback-moderation-prompt";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/** A small, fast model is plenty here; the chat model is the fallback. */
const MODERATION_MODEL =
  process.env.OPENAI_FEEDBACK_MODEL || process.env.OPENAI_CHAT_MODEL;

const moderationEndpointSchema = z.object({
  results: z
    .array(
      z.object({
        flagged: z.boolean(),
        categories: z.record(z.string(), z.boolean()),
      }),
    )
    .min(1),
});

const classifierSchema = z.object({
  verdict: z.enum(MODERATION_VERDICTS),
  reasons: z.array(z.string().max(40)).max(3),
  flaggedTerms: z.array(z.string().max(60)).max(10),
  profanity: z.boolean(),
  spam: z.boolean(),
  containsPII: z.boolean(),
  offTopic: z.boolean(),
  injectionAttempt: z.boolean(),
});

/**
 * Stage 1: OpenAI's moderation endpoint. Free, fast and trained for exactly the
 * categories that must never be published. The AI SDK has no helper for it,
 * hence the plain request. It says which categories fired, never which words.
 */
async function checkModerationEndpoint(
  text: string,
): Promise<Omit<ModerationResult, "flaggedTerms">> {
  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
    signal: AbortSignal.timeout(FEEDBACK_MODERATION_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`moderation endpoint answered ${response.status}`);
  }

  const [result] = moderationEndpointSchema.parse(
    await response.json(),
  ).results;

  if (!result?.flagged) return { verdict: "approve", reasons: [] };

  return {
    verdict: "reject",
    reasons: Object.entries(result.categories)
      .filter(([, flagged]) => flagged)
      .map(([category]) => category)
      .slice(0, 3),
  };
}

/**
 * Stage 2: a structured classifier for what the endpoint does not cover —
 * profanity, spam, personal data, gibberish and prompt injection — in any of
 * the site's languages. It also names the offending words, which the endpoint
 * cannot, so the review page can highlight them.
 */
async function classify(text: string): Promise<ModerationResult> {
  if (!MODERATION_MODEL) throw new Error("no moderation model configured");

  const { output } = await generateText({
    model: openai(MODERATION_MODEL),
    system: FEEDBACK_MODERATION_PROMPT,
    prompt: `<feedback>\n${text}\n</feedback>`,
    output: Output.object({ schema: classifierSchema }),
    abortSignal: AbortSignal.timeout(FEEDBACK_MODERATION_TIMEOUT_MS),
    // Same as the chat route: keep the visitor's text out of OpenAI-side retention.
    providerOptions: { openai: { store: false } },
  });

  // The model's flags can disagree with its own verdict; a raised flag wins.
  const verdict =
    output.profanity || output.spam || output.containsPII || output.injectionAttempt
      ? "reject"
      : output.verdict;

  return {
    verdict,
    reasons: output.reasons,
    flaggedTerms: output.flaggedTerms,
  };
}

/**
 * Keeps only terms that really occur in the text. The highlighter matches them
 * literally, so a paraphrase or an invented word would just be noise.
 */
function presentTerms(terms: string[], text: string): string[] {
  const haystack = text.toLowerCase();
  const seen = new Set<string>();
  return terms
    .map((term) => term.trim())
    .filter((term) => {
      const key = term.toLowerCase();
      if (!key || seen.has(key) || !haystack.includes(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * Screens a feedback entry before it is stored. Returns `null` when either
 * stage is unreachable, which the route treats as "wait for review": failing
 * closed costs nothing here, because nothing is published without the owner's
 * approval anyway.
 *
 * Both stages run at once, so the wait is the slower of the two rather than
 * their sum, and the classifier's flagged words are there even when the
 * endpoint is what rejected the entry.
 *
 * The name is moderated with the message, since it is published beside it.
 */
export async function moderateFeedback(
  message: string,
  name: string | null,
): Promise<ModerationResult | null> {
  const text = name ? `Name: ${name}\n\n${message}` : message;

  const [endpoint, classifier] = await Promise.allSettled([
    checkModerationEndpoint(text),
    classify(text),
  ]);

  // Says which stage failed and why, so a misconfigured model or key shows up
  // in the logs. Capped, because provider messages can run long.
  const stages = [
    ["moderation endpoint", endpoint],
    [`classifier (model=${MODERATION_MODEL ?? "unset"})`, classifier],
  ] as const;
  for (const [stage, result] of stages) {
    if (result.status === "rejected") {
      const error: unknown = result.reason;
      const detail =
        error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      console.warn(
        `[feedback] moderation unavailable at ${stage} — ${detail}`.slice(0, 400),
      );
    }
  }

  if (endpoint.status === "rejected" || classifier.status === "rejected") {
    return null;
  }

  const flaggedTerms = presentTerms(classifier.value.flaggedTerms, text);

  if (endpoint.value.verdict === "reject") {
    return {
      verdict: "reject",
      reasons: [
        ...new Set([...endpoint.value.reasons, ...classifier.value.reasons]),
      ],
      flaggedTerms,
    };
  }

  return { ...classifier.value, flaggedTerms };
}

