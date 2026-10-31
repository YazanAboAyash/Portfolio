/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AdminFeedbackListResponse,
  FeedbackAdminFilters,
  FeedbackStatus,
} from "@/types/configs/feedback";
import { FEEDBACK_ADMIN_PAGE_SIZE } from "@/data/configs/feedback";

const SESSION_EXPIRED =
  "Your session has expired. Sign in again from the admin workspace.";
const LOAD_FAILED = "Unable to load feedback. Please try again.";

/**
 * The admin review queue: lists entries through `/api/admin/feedback` and
 * approves, rejects or deletes them. Authenticated by the admin workspace's
 * session cookie, so no token is handled here.
 */
export function useFeedbackAdmin() {
  const [filters, setFiltersState] = useState<FeedbackAdminFilters>({
    status: "pending",
    topic: "all",
    search: "",
  });
  const [offset, setOffsetState] = useState(0);
  // Bumped to reload the current page after a mutation or on refresh.
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState<AdminFeedbackListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Whatever changes the request sets `loading` first, so the effect itself
  // only sets state once the request settles.
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      status: filters.status,
      limit: String(FEEDBACK_ADMIN_PAGE_SIZE),
      offset: String(offset),
    });
    if (filters.topic !== "all") params.set("topic", filters.topic);
    if (filters.search) params.set("searchQuery", filters.search);

    fetch(`/api/admin/feedback?${params}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            response.status === 401 ? SESSION_EXPIRED : LOAD_FAILED,
          );
        }
        setData((await response.json()) as AdminFeedbackListResponse);
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : LOAD_FAILED);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filters, offset, reloadKey]);

  const setFilters = useCallback((next: FeedbackAdminFilters) => {
    setLoading(true);
    setOffsetState(0);
    setFiltersState(next);
  }, []);

  const setOffset = useCallback((next: number) => {
    setLoading(true);
    setOffsetState(Math.max(0, next));
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  /** Runs one mutation, then reloads so the counts and the page stay right. */
  const mutate = useCallback(
    async (id: string, request: () => Promise<Response>, failure: string) => {
      setBusyId(id);
      setError(null);
      try {
        const response = await request();
        if (!response.ok) {
          throw new Error(response.status === 401 ? SESSION_EXPIRED : failure);
        }
        // The last entry on a later page is gone; step back instead of
        // showing an empty page.
        if (data?.entries.length === 1 && offset > 0) {
          setOffset(offset - FEEDBACK_ADMIN_PAGE_SIZE);
        } else {
          refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : failure);
      } finally {
        setBusyId(null);
      }
    },
    [data, offset, refresh, setOffset],
  );

  /** `clearName` erases the display name for good, publishing as Anonymous. */
  const review = useCallback(
    (id: string, status: FeedbackStatus, clearName = false) =>
      mutate(
        id,
        () =>
          fetch("/api/admin/feedback", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status, clearName }),
          }),
        "Unable to update this entry. Please try again.",
      ),
    [mutate],
  );

  const remove = useCallback(
    (id: string) =>
      mutate(
        id,
        () =>
          fetch(`/api/admin/feedback?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
          }),
        "Unable to delete this entry. Please try again.",
      ),
    [mutate],
  );

  return {
    filters,
    setFilters,
    offset,
    setOffset,
    data,
    loading,
    busyId,
    error,
    refresh,
    review,
    remove,
  };
}
