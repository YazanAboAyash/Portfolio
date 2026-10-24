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
  /** One supporting sentence under the title. */
  readonly lead?: ReactNode;
  /** Sits at the far end of the heading row: a filter, a link, an action. */
  readonly aside?: ReactNode;
  readonly className?: string;
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
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-10 gap-y-6",
        className,
      )}
    >
      <div className="max-w-2xl space-y-3">
        <h2
          id={id}
          className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
        >
          <ScrambleText text={title} />
        </h2>
        {lead && (
          <p className="text-base leading-relaxed text-foreground/80 sm:text-lg">
            {lead}
          </p>
        )}
      </div>
      {aside}
    </div>
  );
}
