/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAuditRateLimit } from "@/lib/live-tools/audit-rate-limit";
import {
  AUDIT_SYSTEM_PROMPT,
  AUDIT_QUESTION_CONTEXT,
  QUESTION_IDS,
} from "@/data/live-tools/automation-audit";
import { sanitizeErrorMessage } from "@/lib/security";
import type {
  AuditApiResponse,
  AuditResult,
  AuditAnswers,
} from "@/types/live-tools/automation-audit";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL;
const AUDIT_ENABLED = process.env.AUDIT_ENABLED !== "false"; // Default: enabled

const optionEnum = z.enum(["a", "b", "c", "d"]);

const auditRequestSchema = z.object({
  answers: z.object({
    q1: optionEnum,
    q2: optionEnum,
    q3: optionEnum,
    q4: optionEnum,
    q5: optionEnum,
    q6: optionEnum,
    q7: optionEnum,
    q8: optionEnum,
  }),
});

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

function getClientIP(request: NextRequest): string {
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const realIp = request.headers.get("x-real-ip");
  const forwarded = request.headers.get("x-forwarded-for");
  return cfConnectingIp ?? realIp ?? forwarded?.split(",")[0] ?? "127.0.0.1";
}

function buildUserMessage(answers: AuditAnswers): string {
  const lines = QUESTION_IDS.map((qid) => {
    const ctx = AUDIT_QUESTION_CONTEXT[qid];
    const selectedOption = answers[qid];
    return `- ${ctx.label}: ${ctx.options[selectedOption]}`;
  });

  return `Here are my business answers:\n\n${lines.join("\n")}\n\nPlease provide personalised automation recommendations.`;
}

async function callOpenAI(userMessage: string): Promise<AuditResult> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  if (!OPENAI_CHAT_MODEL) {
    throw new Error("OpenAI chat model not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      messages: [
        { role: "system", content: AUDIT_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      // Reasoning-class models reject `max_tokens`, and this cap also covers
      // their hidden reasoning tokens — 1024 left no room for the JSON answer.
      max_completion_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => ({}))) as OpenAIChatResponse;
    const message = errorData.error?.message ?? "Unknown error";

    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after") ?? "60";
      throw new Error(`QUOTA_EXCEEDED:${retryAfter}:${message}`);
    }

    throw new Error(`OpenAI API error: ${response.status} - ${message}`);
  }

  const data = (await response.json()) as OpenAIChatResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from OpenAI API");
  }

  const parsed = JSON.parse(content) as AuditResult;

  if (
    !parsed.summary ||
    !Array.isArray(parsed.topAutomations) ||
    !parsed.ctaMessage
  ) {
    throw new Error("Invalid JSON structure from OpenAI API");
  }

  return parsed;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!AUDIT_ENABLED) {
    return NextResponse.json(
      { error: "Audit tool is temporarily disabled." },
      { status: 503 },
    );
  }

  const clientIP = getClientIP(request);
  const { allowed, remaining } = checkAuditRateLimit(clientIP);

  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "Rate limit exceeded. You have used all your free audits for today.",
      },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0", "Retry-After": "86400" },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = auditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const answers = parsed.data.answers as AuditAnswers;
  const userMessage = buildUserMessage(answers);

  try {
    const result = await callOpenAI(userMessage);
    const responseBody: AuditApiResponse = { result, remaining };

    return NextResponse.json(responseBody, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.startsWith("QUOTA_EXCEEDED:")) {
      return NextResponse.json(
        { error: "OpenAI quota exceeded. Please try again later." },
        { status: 503 },
      );
    }

    console.error("[automation-audit] OpenAI call failed:", message);
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 },
    );
  }
}
