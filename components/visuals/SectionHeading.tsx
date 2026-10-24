/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrambleText } from "./ScrambleText";

interface SectionHeadingProps {
  readonly title: string;
  readonly id?: string;
  /** One supporting sentence under the title; shown from `sm`, phones skip it. */
  readonly lead?: ReactNode;
  /** Sits at the far end of the heading row: a filter, a link, an action. */
  readonly aside?: ReactNode;
  readonly className?: string;
  /** `h1` when the heading opens its own page rather than a home section. */
  readonly as?: "h1" | "h2";
}

/**
 * The v7 section title: left-aligned, large, the scramble kept from v6. The
 * lead stays in the full ink at reading size, and `aside` answers the title
 * on the right so the row never leaves half the width empty.
 */
export function SectionHeading({
  title,
  id,
  lead,
  aside,
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-10 gap-y-6",
        className,
      )}
    >
      <div className="max-w-2xl space-y-3">
        <Heading
          id={id}
          className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
        >
          <ScrambleText text={title} />
        </Heading>
        {lead && (
          <p className="hidden text-base leading-relaxed text-foreground/80 sm:block sm:text-lg">
            {lead}
          </p>
        )}
      </div>
      {aside}
    </div>
  );
}
