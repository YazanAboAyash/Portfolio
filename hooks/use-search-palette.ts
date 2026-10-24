/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  BLOG_SEARCH_DEBOUNCE_MS,
  BLOG_SEARCH_LIMIT,
  BLOG_SEARCH_MIN_LENGTH,
} from "@/data/configs/search";
import type { BlogListResponse } from "@/types/hubs/blogs";
import type { BlogSearchHit } from "@/types/configs/search";

const emptySubscribe = () => () => {};

/** Open state of the search palette, toggled by Ctrl+K (⌘K on Apple devices). */
export function useSearchPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, setOpen };
}

/** Whether the shortcut hint should read ⌘ instead of Ctrl. `false` on the server. */
export function useIsApplePlatform() {
  return useSyncExternalStore(
    emptySubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false,
  );
}

interface BlogSearchState {
  query: string;
  posts: BlogSearchHit[];
}

/**
 * Published posts matching `query`, fetched from the public blog API once
 * typing pauses. `loading` is true from the first keystroke until the answer
 * for the current query arrives.
 */
export function useBlogSearch(query: string) {
  const term = query.trim();
  const enabled = term.length >= BLOG_SEARCH_MIN_LENGTH;
  const [result, setResult] = useState<BlogSearchState>({
    query: "",
    posts: [],
  });

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({
        search: term,
        limit: String(BLOG_SEARCH_LIMIT),
      });
      try {
        const response = await fetch(`/api/blog?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = response.ok
          ? ((await response.json()) as BlogListResponse)
          : null;
        setResult({ query: term, posts: data?.blogs ?? [] });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Blog search failed:", error);
        setResult({ query: term, posts: [] });
      }
    }, BLOG_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [term, enabled]);

  const isCurrent = enabled && result.query === term;
  return {
    posts: isCurrent ? result.posts : [],
    loading: enabled && !isCurrent,
  };
}
