/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  FeedbackErrorCode,
  FeedbackInput,
  FeedbackListResponse,
  FeedbackSubmitResponse,
  PublicFeedbackEntry,
} from "@/types/configs/feedback";

const ERROR_CODES: readonly string[] = [
  "INVALID_INPUT",
  "RATE_LIMIT_EXCEEDED",
  "DAILY_LIMIT",
  "DUPLICATE",
  "SERVICE_UNAVAILABLE",
] satisfies readonly FeedbackErrorCode[];

function isErrorCode(value: string): value is FeedbackErrorCode {
  return ERROR_CODES.includes(value);
}

/**
 * Approved entries for the wall, or `null` once the request has failed.
 * `undefined` while the request is still running.
 */
export function useFeedbackWall() {
  const [entries, setEntries] = useState<
    PublicFeedbackEntry[] | null | undefined
  >(undefined);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/feedback", { signal: controller.signal })
      .then((res) =>
        res.ok ? (res.json() as Promise<FeedbackListResponse>) : null,
      )
      .then((data) => setEntries(data?.entries ?? null))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setEntries(null);
      });

    return () => controller.abort();
  }, []);

  return entries;
}

export type FeedbackSubmitState =
  | { status: "idle" | "sending" }
  | { status: "sent"; outcome: FeedbackSubmitResponse["outcome"] }
  | { status: "error"; code: FeedbackErrorCode };

/**
 * Sends one submission. The server answers failures with a bare code, which is
 * passed through for the form to translate; anything else (a network error, a
 * proxy page) becomes SERVICE_UNAVAILABLE.
 */
export function useFeedbackSubmit() {
  const [state, setState] = useState<FeedbackSubmitState>({ status: "idle" });

  const submit = useCallback(async (input: FeedbackInput): Promise<boolean> => {
    setState({ status: "sending" });

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const body = (await res.json()) as FeedbackSubmitResponse;
        setState({
          status: "sent",
          outcome: body.outcome === "filed" ? "filed" : "queued",
        });
        return true;
      }

      const body = (await res.text()).trim();
      setState({
        status: "error",
        code: isErrorCode(body) ? body : "SERVICE_UNAVAILABLE",
      });
    } catch {
      setState({ status: "error", code: "SERVICE_UNAVAILABLE" });
    }

    return false;
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
