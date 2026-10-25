/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/Drawer";
import { stackTechs } from "@/data/main/capabilitiesData";
import { projects } from "@/data/hubs/projectsData";
import { products } from "@/data/hubs/productsData";
import { useIsMobile } from "@/hooks/use-mobile";
import type { StackGroup, StackTech } from "@/types/main/capabilities";
import { cn } from "@/lib/utils";

const GROUPS: readonly StackGroup[] = ["ai", "frontend", "backend", "tooling"];
const DEFAULT_TECH = "nextjs";

interface Usage {
  key: string;
  title: string;
  kind: "project" | "product" | "site";
  href: string;
  external: boolean;
  /** Matched tags, or how this site uses the technology */
  detail: string;
}

function matches(tech: StackTech, technologies: readonly string[]) {
  const aliases = tech.aliases.map((alias) => alias.toLowerCase());
  return technologies.filter((name) => aliases.includes(name.toLowerCase()));
}

/** Everywhere a technology is used: open-source projects, products, this site. */
function findUsage(tech: StackTech): Usage[] {
  const usage: Usage[] = [];

  for (const project of projects) {
    const hit = matches(tech, project.technologies);
    const href = project.githubUrl || project.liveUrl;
    if (hit.length && href) {
      usage.push({
        key: `project-${project.id}`,
        title: project.title,
        kind: "project",
        href,
        external: true,
        detail: hit.join(" · "),
      });
    }
  }

  for (const product of products) {
    const hit = matches(tech, product.technologies);
    if (hit.length) {
      usage.push({
        key: `product-${product.id}`,
        title: product.title,
        kind: "product",
        href: "#products",
        external: false,
        detail: hit.join(" · "),
      });
    }
  }

  if (tech.site) {
    usage.push({
      key: "site",
      title: "coldbydefault.com",
      kind: "site",
      href: "/about-portfolio",
      external: false,
      detail: tech.site,
    });
  }

  return usage;
}

// Static data, so the lookup is built once per bundle
const usageById = new Map(stackTechs.map((tech) => [tech.id, findUsage(tech)]));

// Fixed number of result tiles (the longest list, rounded up to full rows of
// four). Unused slots render empty, so the block never changes size.
const SLOTS =
  Math.ceil(Math.max(...[...usageById.values()].map((u) => u.length)) / 4) * 4;

function UsageTile({
  item,
  kindLabel,
  onNavigate,
}: {
  item: Usage;
  kindLabel: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      {...(item.external && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
      {...(onNavigate && { onClick: onNavigate })}
      className="group flex h-full flex-col gap-1 bg-surface p-4 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <span className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-sm font-semibold leading-snug">
          {item.title}
        </span>
        {item.external ? (
          <ArrowUpRight
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        ) : (
          <ArrowRight
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="text-xs text-muted-foreground">{kindLabel}</span>
      <span className="mt-auto line-clamp-1 text-xs text-muted-foreground">
        {item.detail}
      </span>
    </Link>
  );
}

/**
 * Pick a technology, see where it is used. Sits under the capability cards.
 * On phones the chips fill the screen, so the results open in a bottom sheet
 * instead of landing below the fold.
 */
export function StackExplorer() {
  const t = useTranslations("Capabilities.explorer");
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState(DEFAULT_TECH);
  // Collapsed by default at every size; the title toggles it
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const panelId = useId();
  const usage = usageById.get(selectedId) ?? [];

  const select = (id: string) => {
    setSelectedId(id);
    if (isMobile) setSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 border-t border-surface-2 pt-8 md:pt-12">
      <div className="flex max-w-[60ch] flex-col gap-2">
        <h3 className="text-2xl font-bold leading-tight tracking-[-0.015em]">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:w-auto md:justify-start"
          >
            {t("title")}
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        </h3>
        {open && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {t("lead")}
          </p>
        )}
      </div>

      <div
        id={panelId}
        className={cn("flex-col gap-8", open ? "flex" : "hidden")}
      >
        <div className="flex flex-col gap-5">
          {GROUPS.map((group) => (
            <div
              key={group}
              role="group"
              aria-labelledby={`stack-group-${group}`}
              className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-4"
            >
              <span
                id={`stack-group-${group}`}
                className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
              >
                {t(`groups.${group}`)}
              </span>
              <div className="flex flex-wrap gap-2">
                {stackTechs
                  .filter((tech) => tech.group === group)
                  .map((tech) => {
                    const selected = tech.id === selectedId;
                    return (
                      <button
                        key={tech.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => select(tech.id)}
                        className={cn(
                          "inline-flex min-h-10 cursor-pointer items-center gap-2 px-3.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface hover:bg-surface-2",
                        )}
                      >
                        {t(`tech.${tech.id}`)}
                        <span
                          className={cn(
                            "text-xs tabular-nums",
                            selected
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                          aria-hidden="true"
                        >
                          {usageById.get(tech.id)?.length ?? 0}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {!isMobile && (
          <div className="flex flex-col gap-3">
            <p aria-live="polite" className="text-sm font-semibold">
              {t(`tech.${selectedId}`)}
              <span className="font-normal text-muted-foreground">
                {" · "}
                {t("usedIn", { count: usage.length })}
              </span>
            </p>
            <ul key={selectedId} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Array.from({ length: SLOTS }, (_, i) => {
                const item = usage[i];
                if (!item) {
                  return (
                    <li
                      key={`empty-${i}`}
                      aria-hidden="true"
                      className="h-32 border border-dashed border-surface-2"
                    />
                  );
                }
                return (
                  <li
                    key={item.key}
                    className="h-32 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
                  >
                    <UsageTile item={item} kindLabel={t(`kinds.${item.kind}`)} />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <Drawer open={isMobile && sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold">
              {t(`tech.${selectedId}`)}
            </DrawerTitle>
            <DrawerDescription>
              {t("usedIn", { count: usage.length })}
            </DrawerDescription>
          </DrawerHeader>
          <ul className="flex flex-col gap-2 overflow-y-auto px-4">
            {usage.map((item) => (
              <li key={item.key}>
                <UsageTile
                  item={item}
                  kindLabel={t(`kinds.${item.kind}`)}
                  onNavigate={() => setSheetOpen(false)}
                />
              </li>
            ))}
          </ul>
          <DrawerFooter>
            <DrawerClose asChild>
              <button
                type="button"
                className="min-h-11 cursor-pointer bg-surface px-5 font-semibold transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                {t("close")}
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
