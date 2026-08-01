/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";

/**
 * Homepage anchor ids in document order — one major graduation each. The
 * sections below the fold are lazy-loaded, so a lookup can legitimately come
 * back empty on first paint; every read here tolerates that rather than
 * assuming the whole page is mounted.
 */
const SECTION_IDS = [
  "home",
  "speed-insight",
  "projects",
  "cert",
  "services",
  "use-cases",
  "github",
  "capabilities",
] as const;

/**
 * How far down the viewport a section has to reach to claim the rail. Set above
 * the middle so a tick lights up as the section's heading arrives, not once the
 * section has already filled the screen.
 */
const PROBE_RATIO = 0.35;

/** Sticky navbar height (h-16) plus air, so a heading clears it after a jump. */
const SCROLL_OFFSET = 80;

/**
 * Slack when testing for the end of the document. Fractional scroll heights on
 * zoomed or hidpi viewports leave the sum a hair short of the real bottom.
 */
const BOTTOM_SLACK = 2;

/**
 * A ruler pinned to the right edge, next to the scrollbar: fine graduations for
 * texture, one longer tick per section. The tick tracking the section you're
 * reading stays extended; hovering any tick names its anchor, and clicking
 * scrolls there. Desktop only — the labels are hover-driven, which touch has no
 * equivalent for, and the navbar menu already covers small screens.
 */
export default function SectionRail() {
  const t = useTranslations("SectionRail");
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(SECTION_IDS[0]);

  useEffect(() => {
    let frame = 0;

    const probe = () => {
      frame = 0;
      const line = window.innerHeight * PROBE_RATIO;

      // Last section past the probe line wins, so overlapping sections resolve
      // to the lower one — the direction you're reading in.
      let current: string = SECTION_IDS[0];
      for (const id of SECTION_IDS) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) current = id;
      }

      // The final section is shorter than the viewport it ends in, so it can
      // never push its own top past the probe line. Without this the rail
      // stalls one tick short at the bottom of the page.
      const last = SECTION_IDS[SECTION_IDS.length - 1];
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - BOTTOM_SLACK;

      setActiveId(atBottom && last ? last : current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };

    probe();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const target = document.getElementById(id);
      if (!target) return;

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  return (
    <nav
      aria-label={t("label")}
      className="fixed right-0 top-1/2 z-40 hidden h-[60vh] -translate-y-1/2 select-none flex-col items-end lg:flex"
    >
      {/* Fine graduations and the spine they hang off — texture only. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1.5 border-r border-foreground/15 text-foreground/15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px 5px)",
        }}
      />

      {SECTION_IDS.map((id) => {
        const isActive = id === activeId;

        return (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id)}
            aria-label={t("scrollTo", { section: id })}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex flex-1 cursor-pointer items-center justify-end rounded-sm pl-3 pr-1 focus-visible:outline-1 focus-visible:outline-ring"
          >
            {/*
              Pinned to the button's left edge so it trails whatever width the
              tick currently has, and inert to the pointer so the invisible chip
              never swallows a click meant for the page behind it.
            */}
            <span className="pointer-events-none absolute right-full mr-2 rounded-sm border border-border bg-background/90 px-1.5 py-0.5 font-mono text-[10px] leading-none tracking-widest text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
              #{id}
            </span>
            <span
              className={`h-px transition-all duration-300 motion-reduce:transition-none ${
                isActive
                  ? "w-8 bg-foreground"
                  : "w-4 bg-foreground/30 group-hover:w-6 group-hover:bg-foreground/70"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
