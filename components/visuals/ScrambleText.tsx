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
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?`~";

/** How long one decode pass takes. Retunes every section title at once. */
const SCRAMBLE_MS = 1000;

/** How long one random glyph stays put — slow enough to read as churn. */
const GLYPH_INTERVAL = 80;

/**
 * Share of the pass spent fully scrambled before the reveal starts sweeping.
 * Without it the leading characters resolve within a glyph swap or two of the
 * start and never visibly churn.
 */
const CHURN_RATIO = 0.45;

/**
 * Trigger zone: the middle half of the viewport, as an IntersectionObserver
 * root margin. Keying off a band rather than raw visibility matters for the
 * last section on the page — once you hit the bottom of the document its title
 * is stuck on screen, so a plain visibility test latches on and can never fire
 * again. Against a band it still enters and leaves, and re-scrambles like the
 * rest.
 */
const TRIGGER_BAND = "-25% 0px -25% 0px";

/**
 * Faintest an unresolved glyph goes. Below this the churn thins out to the point
 * the title looks like it's missing characters rather than decoding them.
 */
const MIN_GLYPH_OPACITY = 0.3;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/**
 * Fading the inherited color is what makes a glyph gray in either theme: the
 * titles are solid black on white and white on black, so a half-transparent
 * character lands on gray both ways, where a literal gray would only read as
 * one of the two.
 */
const randomShade = () =>
  (MIN_GLYPH_OPACITY + Math.random() * (1 - MIN_GLYPH_OPACITY)).toFixed(2);

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
      { rootMargin: TRIGGER_BAND },
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
    const glyphs: string[] = [];
    const shades: string[] = [];

    // One span per character, written straight to the DOM: shading a glyph on
    // its own needs an element of its own, and at 60fps across every title on
    // the page, re-rendering React for each frame would be pure overhead. The
    // spans collapse back to a single text node the moment the pass ends, so
    // the title at rest is laid out exactly as it was before — split spans and
    // plain text don't kern identically at heading sizes.
    // Indexed rather than iterated, so a cell always lines up with the
    // character the pass below addresses as text[i].
    const cells = Array.from({ length: text.length }, (_, i) => {
      const cell = document.createElement("span");
      cell.textContent = text[i] ?? "";
      return cell;
    });
    node.replaceChildren(...cells);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      startedAt ||= now;

      const elapsed = now - startedAt;
      if (elapsed >= SCRAMBLE_MS) {
        cancelAnimationFrame(frame);
        node.textContent = text;
        return;
      }

      // Everything churns through the opening stretch, then the reveal sweeps
      // left to right across what's left of the pass.
      const churnMs = SCRAMBLE_MS * CHURN_RATIO;
      const sweep = Math.max(0, elapsed - churnMs) / (SCRAMBLE_MS - churnMs);
      const revealed = sweep * text.length;
      const swapGlyphs = now - lastSwap >= GLYPH_INTERVAL;
      if (swapGlyphs) lastSwap = now;

      for (let i = 0; i < text.length; i++) {
        const char = text[i] ?? "";
        const cell = cells[i];
        if (!cell) continue;

        if (i < revealed || char === " ") {
          if (cell.textContent !== char) cell.textContent = char;
          if (cell.style.opacity) cell.style.opacity = "";
          continue;
        }

        // Keep the previous glyph and its shade between swaps so the noise
        // reads as text, not as a per-frame strobe.
        if (swapGlyphs || !glyphs[i]) {
          glyphs[i] = randomGlyph() ?? "";
          shades[i] = randomShade();
        }

        const glyph = glyphs[i] ?? "";
        const shade = shades[i] ?? "";
        if (cell.textContent !== glyph) cell.textContent = glyph;
        if (cell.style.opacity !== shade) cell.style.opacity = shade;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      node.textContent = text;
    };
  }, [inView, reduceMotion, text]);

  return (
    <span ref={containerRef} className={`grid ${className ?? ""}`.trimEnd()}>
      {/*
        Stays in flow at zero opacity: reserves the final box so resolving
        glyphs never reflow the heading, and — unlike visibility:hidden — keeps
        the real title in the accessibility tree for screen readers and
        crawlers. The layer above it is the one that actually animates.
      */}
      <span className="col-start-1 row-start-1 opacity-0">{text}</span>
      <span
        ref={outputRef}
        className="col-start-1 row-start-1"
        aria-hidden="true"
      >
        {text}
      </span>
    </span>
  );
}
