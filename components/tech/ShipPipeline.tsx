/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useRef, useState } from "react";
import {
  m,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { capabilities, pipelineStages } from "@/data/main/capabilitiesData";
import { cn } from "@/lib/utils";
import { iconMap } from "./capability-icons";

/** Where on screen the shipment sits while scrolling (share of viewport height). */
const TRACK_LINE = "60%";

/**
 * The path a change takes from commit to production, drawn as a rail. As the page
 * scrolls, a marker rides the rail at {@link TRACK_LINE} of the viewport and
 * each stage lights up once the marker reaches it. With reduced motion the
 * rail is drawn in full and every stage is lit.
 */
export function ShipPipeline() {
  const t = useTranslations("Capabilities");
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: [`start ${TRACK_LINE}`, `end ${TRACK_LINE}`],
  });
  // Rail length (first to last stage node) and how much of it is travelled, in px
  const railLength = useMotionValue(0);
  const travelled = useMotionValue(0);
  const [reached, setReached] = useState(-1);

  // Positions are read from the DOM on every update, so the rail follows
  // wrapping text in longer locales without a separate resize listener.
  const update = (progress: number) => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>(":scope > li"));
    const end = items.at(-1)?.offsetTop ?? 0;
    const tip = reduceMotion ? end : Math.min(progress * list.offsetHeight, end);

    railLength.set(end);
    travelled.set(Math.max(tip, 0));

    let next = -1;
    items.forEach((item, index) => {
      if (item.offsetTop <= tip) next = index;
    });
    setReached(next);
  };

  useMotionValueEvent(scrollYProgress, "change", update);

  // Place the rail on mount, before the first scroll
  useEffect(() => {
    update(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  return (
    <ol ref={listRef} className="relative flex flex-col">
      {/* Rail, its travelled part, and the shipment riding it */}
      <m.div
        aria-hidden="true"
        className="absolute left-3 top-3 w-px -translate-x-1/2 bg-border"
        style={{ height: railLength }}
      />
      <m.div
        aria-hidden="true"
        className="absolute left-3 top-3 w-0.5 -translate-x-1/2 bg-foreground"
        style={{ height: travelled }}
      />
      {!reduceMotion && (
        <m.div
          aria-hidden="true"
          className="absolute left-3 top-3 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 bg-primary"
          style={{ y: travelled }}
        />
      )}

      {pipelineStages.map((stage, index) => {
        const lit = index <= reached;
        const isLive = stage.id === "live";
        const capability = capabilities.find(
          (item) => item.id === stage.capabilityId,
        );
        const CapabilityIcon = capability ? iconMap[capability.icon] : null;

        return (
          <li
            key={stage.id}
            className="grid grid-cols-[1.5rem_1fr] gap-x-4 pb-10 last:pb-0 md:gap-x-6 md:pb-12"
          >
            {/* Stage node */}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-0 mt-0.5 h-5 w-5 justify-self-center border-2 transition-colors duration-500",
                lit
                  ? isLive
                    ? "border-green-500 bg-green-500"
                    : "border-foreground bg-foreground"
                  : "border-border bg-background",
              )}
            >
              {lit && isLive && (
                <span className="absolute inset-0 bg-green-500 motion-safe:animate-ping" />
              )}
            </span>

            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-sm text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h4
                  className={cn(
                    "text-xl font-bold leading-tight tracking-[-0.015em] transition-colors duration-500 md:text-2xl",
                    lit ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t(`pipeline.stages.${stage.id}.label`)}
                </h4>
                {capability && (
                  <span className="inline-flex items-center gap-1.5 bg-surface px-2 py-0.5 text-sm font-semibold">
                    {CapabilityIcon && (
                      <CapabilityIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {t(capability.titleKey)}
                  </span>
                )}
              </div>

              <p className="max-w-[52ch] text-sm leading-relaxed md:text-base">
                {t(`pipeline.stages.${stage.id}.detail`)}
              </p>

              <p className="text-sm text-muted-foreground">
                {t(`pipeline.stages.${stage.id}.practices`)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
