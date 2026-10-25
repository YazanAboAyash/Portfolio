/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { BlogHeading } from "@/types/hubs/blogs";

/**
 * Anchor id for a heading's plain text. The markdown renderer and
 * `getBlogHeadings` both call this, so rail links always match the h2 ids.
 */
export function slugifyHeading(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
  return slug || "section";
}

/** The `##` headings of a markdown post, skipping fenced code blocks. */
export function getBlogHeadings(markdown: string): BlogHeading[] {
  const headings: BlogHeading[] = [];
  let inFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    const match = inFence ? null : /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match?.[1]) continue;

    // Drop link targets and inline markers so the text matches the rendered h2
    const title = match[1]
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`~]/g, "")
      .trim();
    headings.push({ id: slugifyHeading(title), title });
  }

  return headings;
}
