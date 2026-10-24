/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useState } from "react";
import type { Blog, BlogListResponse } from "@/types/hubs/blogs";

/**
 * The newest published post from the public blog API, or `null` once the
 * request has finished without one (no posts, rate limit, network error).
 * `undefined` while the request is still running.
 */
export function useLatestPost() {
  const [post, setPost] = useState<Blog | null | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/blog?limit=1", { signal: controller.signal })
      .then((res) =>
        res.ok ? (res.json() as Promise<BlogListResponse>) : null,
      )
      .then((data) => setPost(data?.blogs[0] ?? null))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setPost(null);
      });

    return () => controller.abort();
  }, []);

  return post;
}
