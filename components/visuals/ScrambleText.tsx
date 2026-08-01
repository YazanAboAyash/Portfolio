/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Glyph pool the unresolved characters cycle through. */
const GLYPHS =
  "101011011100010100010101001001";

/** How long one decode pass takes. Retunes every section title at once. */
const SCRAMBLE_MS = 1000;

/** How long one random glyph stays put — slow enough to read as churn. */
const GLYPH_INTERVAL = 80;

/** Share of the title that must be on screen before it decodes. */
const VISIBLE_THRESHOLD = 0.6;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

interface ScrambleTextProps {
  readonly text: string;
  readonly className?: string;
}

/**
 * Decodes {@link text} left to right — random glyphs resolving into the real
 * string — every time the title scrolls into view, coming from either
 * direction. The real string is what gets server-rendered and handed to screen
 * readers, so only sighted users on a live viewport ever see the scramble.
 */
export function ScrambleText({ text, className }: ScrambleTextProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLSpanElement>(null);
  const outputRef = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  // Tracks visibility rather than firing once, so scrolling back to a section
  // decodes its title again — from either direction.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry?.isIntersecting ?? false);
      },
      { threshold: VISIBLE_THRESHOLD },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = outputRef.current;
    if (!node || !inView || reduceMotion) return;

    let frame = 0;
    let startedAt = 0;
    let lastSwap = 0;
    let glyphs = "";
    let painted = text;

    // Written straight to the DOM: at 60fps across every title on the page,
    // re-rendering React for each frame would be pure overhead.
    const paint = (next: string) => {
      if (next === painted) return;
      painted = next;
      node.textContent = next;
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      startedAt ||= now;

      const elapsed = now - startedAt;
      if (elapsed >= SCRAMBLE_MS) {
        cancelAnimationFrame(frame);
        paint(text);
        return;
      }

      const revealed = (elapsed / SCRAMBLE_MS) * text.length;
      const swapGlyphs = now - lastSwap >= GLYPH_INTERVAL;
      if (swapGlyphs) lastSwap = now;

      let next = "";

      for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (i < revealed || char === " ") {
          next += char;
          continue;
        }

        // Keep the previous glyph between swaps so the noise reads as text,
        // not as a per-frame strobe.
        next += swapGlyphs || !glyphs[i] ? randomGlyph() : glyphs[i];
      }

      glyphs = next;
      paint(next);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      node.textContent = text;
    };
  }, [inView, reduceMotion, text]);

  return (
    <span ref={containerRef} className={`grid ${className ?? ""}`.trimEnd()}>
      <span className="sr-only">{text}</span>
      {/* Reserves the final box so resolving glyphs never reflow the heading. */}
      <span className="col-start-1 row-start-1 invisible" aria-hidden="true">
        {text}
      </span>
      <span ref={outputRef} className="col-start-1 row-start-1" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
