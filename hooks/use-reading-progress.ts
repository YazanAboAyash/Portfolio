/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useState } from "react";

/**
 * Reading progress (0..1) through the element with `bodyId`, and the id of the
 * last heading that has scrolled past the top 30% of the viewport.
 */
export function useReadingProgress(bodyId: string, headingIds: string[]) {
  const [state, setState] = useState({
    progress: 0,
    activeId: headingIds[0] ?? "",
  });
  const idsKey = headingIds.join("|");

  useEffect(() => {
    const ids = idsKey ? idsKey.split("|") : [];
    let frame = 0;

    const compute = () => {
      frame = 0;
      const marker = window.innerHeight * 0.3;
      let progress = 0;
      const body = document.getElementById(bodyId);
      if (body) {
        const rect = body.getBoundingClientRect();
        const scrollable = Math.max(1, rect.height - window.innerHeight * 0.6);
        progress = Math.min(1, Math.max(0, (marker - rect.top) / scrollable));
      }

      let activeId = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= marker) activeId = id;
      }

      setState((prev) =>
        prev.progress === progress && prev.activeId === activeId
          ? prev
          : { progress, activeId },
      );
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [bodyId, idsKey]);

  return state;
}
