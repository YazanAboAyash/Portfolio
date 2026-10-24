/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  SpeedInsightApiResponse,
  SpeedInsightResult,
} from "@/types/configs/speed-insight";
import {
  SPEED_INSIGHT_API,
  CACHE_DURATION_MS,
  REFRESH_COOLDOWN_MS,
} from "./SpeedInsight.constants";

/** State shape for the SpeedInsight hook */
interface SpeedInsightState {
  desktop: SpeedInsightResult | null;
  mobile: SpeedInsightResult | null;
  loading: boolean;
  error: string | null;
}

/** Return type for the useSpeedInsight hook */
interface UseSpeedInsightReturn extends SpeedInsightState {
  refetch: () => Promise<void>;
  /** Seconds remaining until next refresh is allowed (0 = ready) */
  cooldownRemaining: number;
}

/** Cached response to avoid redundant API calls */
let cachedData: SpeedInsightApiResponse | null = null;
let cacheTimestamp = 0;

/** Check if cached data is still valid */
function isCacheValid(): boolean {
  return cachedData !== null && Date.now() - cacheTimestamp < CACHE_DURATION_MS;
}

/**
 * Hook to fetch and manage PageSpeed Insights data
 * Includes caching, error handling, and refetch capability
 */
export function useSpeedInsight(): UseSpeedInsightReturn {
  const [state, setState] = useState<SpeedInsightState>({
    desktop: null,
    mobile: null,
    loading: true,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const lastRefreshRef = useRef<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (force = false): Promise<void> => {
    // Return cached data if valid and not forced
    if (!force && isCacheValid() && cachedData) {
      setState({
        desktop: cachedData.desktop,
        mobile: cachedData.mobile,
        loading: false,
        error: null,
      });
      return;
    }

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const url = force
        ? `${SPEED_INSIGHT_API}?refresh=${Date.now()}`
        : SPEED_INSIGHT_API;

      const response = await fetch(url, {
        signal: controller.signal,
        cache: force ? "no-cache" : "default",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as SpeedInsightApiResponse;

      if (data.error) {
        throw new Error(data.error);
      }

      // Update cache
      cachedData = data;
      cacheTimestamp = Date.now();

      setState({
        desktop: data.desktop,
        mobile: data.mobile,
        loading: false,
        error: null,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    const elapsed = Date.now() - lastRefreshRef.current;
    if (elapsed < REFRESH_COOLDOWN_MS) return;

    lastRefreshRef.current = Date.now();
    setCooldownRemaining(Math.ceil(REFRESH_COOLDOWN_MS / 1000));

    // Start countdown timer
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      const remaining = Math.ceil(
        (REFRESH_COOLDOWN_MS - (Date.now() - lastRefreshRef.current)) / 1000,
      );
      if (remaining <= 0) {
        setCooldownRemaining(0);
        if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      } else {
        setCooldownRemaining(remaining);
      }
    }, 1000);

    await fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    void fetchData();

    return () => {
      abortRef.current?.abort();
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [fetchData]);

  return { ...state, refetch, cooldownRemaining };
}
