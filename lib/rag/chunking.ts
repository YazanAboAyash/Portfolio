/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { ragConfig } from "@/data/configs/rag";

/**
 * Splits Markdown into overlapping chunks of about `ragConfig.chunkSize`
 * characters. Blog content may carry raw HTML (older posts, or anything that
 * got past the write-time sanitizer), so tags are stripped first. Each chunk starts with the document title and its
 * nearest heading, so a chunk still makes sense when retrieved on its own.
 */
export function chunkMarkdown(title: string, markdown: string): string[] {
  // Repeat until stable: removing one block can join the halves of another
  // (`<scr<script></script>ipt>`), which a single pass would leave behind.
  let stripped = markdown;
  for (let previous = ""; previous !== stripped; ) {
    previous = stripped;
    stripped = stripped.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  }

  const text = stripped
    .replace(/<[^>]+>/g, " ")
    .replace(/\r\n/g, "\n")
    // Collapse runs of spaces, but keep indentation (nested data from sources.ts)
    .replace(/(\S)[ \t]+/g, "$1 ")
    .trim();

  const { chunkSize, chunkOverlap } = ragConfig;
  const chunks: string[] = [];
  let heading = "";
  let current = "";

  const flush = () => {
    const body = current.trim();
    if (!body) return;
    const prefix = heading ? `${title} — ${heading}` : title;
    chunks.push(`${prefix}\n\n${body}`);
    // Overlap starts at a word boundary rather than mid-word.
    const tail = body.length > chunkOverlap ? body.slice(-chunkOverlap) : "";
    current = tail.slice(tail.search(/\s/) + 1).trim();
  };

  for (const rawBlock of text.split(/\n{2,}/)) {
    let block = rawBlock.trim();
    const headingMatch = /^#{1,6}\s+(.+)/.exec(block);
    if (headingMatch?.[1]) {
      // No overlap across headings: the new section starts clean. The heading
      // itself moves into the chunk prefix.
      flush();
      current = "";
      const headingText = headingMatch[1].trim();
      heading = headingText === title ? "" : headingText;
      block = block.slice(headingMatch[0].length).trim();
    }
    if (!block) continue;

    // A single block longer than a chunk is cut at line or sentence ends where possible.
    const pieces =
      block.length > chunkSize
        ? (block.match(new RegExp(`[\\s\\S]{1,${chunkSize}}(?=[.!?]\\s|\\n|$)|[\\s\\S]{1,${chunkSize}}`, "g")) ?? [block])
        : [block];

    // Pieces of one block continue on the next line; a new block keeps its blank line.
    let separator = "\n\n";
    for (const piece of pieces.map((part) => part.replace(/^\n+|\s+$/g, ""))) {
      if (!piece.trim()) continue;
      if (current.length + piece.length > chunkSize) flush();
      current += (current ? separator : "") + piece;
      separator = "\n";
    }
  }
  flush();

  // Text that is nothing but headings still gets indexed (and hashed) once.
  if (chunks.length === 0 && text) chunks.push(`${title}\n\n${text}`);

  return chunks;
}
