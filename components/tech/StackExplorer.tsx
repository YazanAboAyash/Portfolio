/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { stackGroups } from "@/data/main/capabilitiesData";
import { techIconMap } from "./capability-icons";

/** The stack, one tab per layer. */
export function StackExplorer() {
  const t = useTranslations("Capabilities.stack");

  return (
    <Tabs defaultValue={stackGroups[0]?.id ?? ""} className="gap-6">
      <TabsList
        aria-label={t("tabsLabel")}
        className="h-auto w-full flex-wrap justify-start gap-1 rounded-none bg-transparent p-0"
      >
        {stackGroups.map((group, index) => (
          <TabsTrigger
            key={group.id}
            value={group.id}
            className="h-auto min-h-10 flex-none cursor-pointer gap-2 rounded-none border-0 bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground focus-visible:ring-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none dark:text-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
          >
            <span className="font-mono text-xs opacity-70" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            {t(`groups.${group.id}`)}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Every panel stays mounted in the same cell, so the block is always as
          tall as its tallest tab and never pushes the page around */}
      <div className="grid">
        {stackGroups.map((group) => (
          <TabsContent
            key={group.id}
            value={group.id}
            forceMount
            className="col-start-1 row-start-1 flex flex-col gap-4 data-[state=inactive]:invisible"
          >
            <ul className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-6">
              {group.tools.map((tool) => {
                const ToolIcon = tool.icon ? techIconMap[tool.icon] : null;
                return (
                  <li
                    key={tool.id}
                    className="flex h-24 flex-col items-center justify-center gap-2 bg-surface p-2 text-center text-sm font-semibold leading-tight"
                  >
                    {ToolIcon && (
                      <ToolIcon
                        className="h-7 w-7 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className="line-clamp-2">{tool.name}</span>
                  </li>
                );
              })}
            </ul>

            {group.practices.length > 0 && (
              <p className="text-sm">
                <span className="font-semibold text-muted-foreground">
                  {t("practices")}:
                </span>{" "}
                {group.practices.join(" · ")}
              </p>
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
