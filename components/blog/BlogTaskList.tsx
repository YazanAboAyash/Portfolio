/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

/**
 * A markdown task list (`- [ ] item`) as a checklist card with progress.
 * The checkboxes stay uncontrolled; the count is read back from the DOM.
 */
export function BlogTaskList({ children }: { children: ReactNode }) {
  const t = useTranslations("Blog");
  const [counts, setCounts] = useState({ done: 0, total: 0 });

  const recount = useCallback((list: HTMLUListElement | null) => {
    if (!list) return;
    const boxes = Array.from(
      list.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
    );
    setCounts({
      done: boxes.filter((box) => box.checked).length,
      total: boxes.length,
    });
  }, []);

  const complete = counts.total > 0 && counts.done === counts.total;
  const percent = counts.total ? (counts.done / counts.total) * 100 : 0;

  return (
    <div className="border border-border bg-surface p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4 font-mono text-xs text-muted-foreground">
        <p className="uppercase tracking-widest">{t("checklistTitle")}</p>
        <p className="tabular-nums" role="status">
          {complete
            ? t("checklistDone")
            : t("checklistProgress", { done: counts.done, total: counts.total })}
        </p>
      </div>
      <div className="mb-5 h-1 overflow-hidden bg-border" aria-hidden="true">
        <div
          className="h-full bg-foreground transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul
        ref={recount}
        onChange={(event) => recount(event.currentTarget)}
        className="space-y-1"
      >
        {children}
      </ul>
    </div>
  );
}
