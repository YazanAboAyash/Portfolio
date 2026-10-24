/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useCallback, useState } from "react";

/**
 * Tracks an element's rendered height, so a wrapper can animate to it when the
 * content changes size. Returns a callback ref and the height in px (null until
 * the first measurement).
 */
export function useMeasuredHeight<T extends HTMLElement>() {
  const [height, setHeight] = useState<number | null>(null);

  const measure = useCallback((node: T | null) => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry)
        setHeight(entry.borderBoxSize[0]?.blockSize ?? node.offsetHeight);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [measure, height] as const;
}
