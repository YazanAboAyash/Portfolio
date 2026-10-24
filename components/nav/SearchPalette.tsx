/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import {
  CornerDownLeft,
  FileText,
  FolderGit2,
  Hash,
  Library,
  Search,
  Settings2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBlogSearch } from "@/hooks/use-search-palette";
import {
  HOME_SECTION_IDS,
  SEARCH_GROUPS,
  SEARCH_PAGES,
} from "@/data/configs/search";
import { LOCALE_NAMES, SUPPORTED_LOCALES } from "@/data/configs/i18n";
import { projects } from "@/data/hubs/projectsData";
import { products } from "@/data/hubs/productsData";
import type { SearchGroupId, SearchResult } from "@/types/configs/search";

const GROUP_ICONS: Record<SearchGroupId, LucideIcon> = {
  pages: FileText,
  sections: Hash,
  work: FolderGit2,
  blog: Library,
  settings: Settings2,
};

/** Sticky navbar height (h-16) plus air, matching the SectionRail jump. */
const SCROLL_OFFSET = 80;

const KBD_CLASS =
  "bg-surface px-1.5 py-0.5 font-sans text-xs font-medium leading-none text-foreground";

/** Lowercase without accents, so "francais" finds "Français". */
function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

interface SearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Site-wide Ctrl/⌘K palette: pages, home sections, projects and products,
 * published blog posts and the theme/language settings. A chosen action runs
 * once the dialog has closed, so scrolling isn't fighting the scroll lock.
 */
export default function SearchPalette({
  open,
  onOpenChange,
}: SearchPaletteProps) {
  const t = useTranslations("Search");
  const pendingAction = useRef<(() => void) | null>(null);

  const select = (item: SearchResult) => {
    pendingAction.current = item.run;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[12vh] translate-y-0 gap-0 overflow-hidden rounded-none border-0 p-0 shadow-[0_24px_80px_oklch(0_0_0/0.35),0_0_0_1px_var(--surface-2)] sm:max-w-xl"
        onCloseAutoFocus={() => {
          const action = pendingAction.current;
          pendingAction.current = null;
          // After the focus returns to the trigger, which would otherwise
          // interrupt a smooth scroll.
          if (action) requestAnimationFrame(action);
        }}
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        {/* Mounted only while open, so the query starts empty every time. */}
        <PaletteBody onSelect={select} />
      </DialogContent>
    </Dialog>
  );
}

function PaletteBody({ onSelect }: { onSelect: (item: SearchResult) => void }) {
  const t = useTranslations("Search");
  const tNav = useTranslations("Navigation");
  const tSections = useTranslations("SectionRail.sections");
  const tCategories = useTranslations("Projects.categories");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const listId = useId();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const { posts, loading } = useBlogSearch(query);

  const staticItems = useMemo<SearchResult[]>(() => {
    const goToSection = (id: string) => {
      if (pathname !== "/") {
        router.push(`/#${id}`);
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };

    const switchLocale = (next: string) => {
      // Same cookie the language menu writes; see LanguageSwitcher.
      const setCookie = (value: string) => {
        document.cookie = value;
      };
      setCookie(`PORTFOLIOVERSIONLATEST_LOCALE=${next}; path=/;`);
      router.refresh();
    };

    const isDark = resolvedTheme === "dark";

    return [
      ...SEARCH_PAGES.map((page) => ({
        id: `page-${page.href}`,
        group: "pages" as const,
        label: tNav(page.labelKey),
        detail: page.href,
        run: () => router.push(page.href),
      })),
      ...HOME_SECTION_IDS.map((id) => ({
        id: `section-${id}`,
        group: "sections" as const,
        label: tSections(id),
        detail: `/#${id}`,
        run: () => goToSection(id),
      })),
      ...projects.map((project) => ({
        id: `project-${project.id}`,
        group: "work" as const,
        label: project.title,
        detail: tCategories(project.category),
        keywords: project.technologies.join(" "),
        run: () => router.push("/projects"),
      })),
      ...products.map((product) => ({
        id: `product-${product.id}`,
        group: "work" as const,
        label: product.title,
        detail: `${t("product")} · ${tCategories(product.category)}`,
        keywords: product.technologies.join(" "),
        run: () => router.push("/projects"),
      })),
      {
        id: "theme",
        group: "settings" as const,
        label: isDark ? t("themeLight") : t("themeDark"),
        keywords: `${t("themeLight")} ${t("themeDark")}`,
        run: () => setTheme(isDark ? "light" : "dark"),
      },
      ...SUPPORTED_LOCALES.map((code) => ({
        id: `locale-${code}`,
        group: "settings" as const,
        label: LOCALE_NAMES[code],
        detail: `${t("language")} · ${code.toUpperCase()}`,
        lang: code,
        current: code === locale,
        run: () => switchLocale(code),
      })),
    ];
  }, [
    t,
    tNav,
    tSections,
    tCategories,
    router,
    pathname,
    locale,
    resolvedTheme,
    setTheme,
    reduceMotion,
  ]);

  // Every word of the query has to appear somewhere in the item's text.
  const visible = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    const matches = (item: SearchResult) => {
      const haystack = normalize(
        [item.label, item.detail, item.keywords].filter(Boolean).join(" "),
      );
      return words.every((word) => haystack.includes(word));
    };

    const blogItems: SearchResult[] = posts.map((post) => ({
      id: `blog-${post.id}`,
      group: "blog",
      label: post.title,
      ...(post.excerpt ? { detail: post.excerpt } : {}),
      run: () => router.push(`/blog/${post.slug}`),
    }));

    const filtered = staticItems.filter(matches);
    // The API has already matched posts against the query (title, excerpt,
    // content), so they are not filtered again here.
    return SEARCH_GROUPS.flatMap((group) =>
      group === "blog"
        ? blogItems
        : filtered.filter((item) => item.group === group),
    );
  }, [query, staticItems, posts, router]);

  const safeIndex = Math.min(activeIndex, visible.length - 1);
  const active = safeIndex >= 0 ? visible[safeIndex] : undefined;
  const optionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => {
    if (safeIndex < 0) return;
    document
      .getElementById(`${listId}-option-${safeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [listId, safeIndex]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const count = visible.length;
    if (event.key === "ArrowDown" && count > 0) {
      event.preventDefault();
      setActiveIndex((safeIndex + 1) % count);
    } else if (event.key === "ArrowUp" && count > 0) {
      event.preventDefault();
      setActiveIndex((safeIndex - 1 + count) % count);
    } else if (event.key === "Enter" && active) {
      event.preventDefault();
      onSelect(active);
    }
  };

  const groups = SEARCH_GROUPS.map((group) => ({
    group,
    entries: visible
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.group === group),
  })).filter(({ entries }) => entries.length > 0);

  return (
    <>
      <div className="flex items-center gap-3 bg-surface px-5">
        <Search
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active ? optionId(safeIndex) : undefined}
          aria-label={t("title")}
          placeholder={t("placeholder")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div
        id={listId}
        role="listbox"
        aria-label={t("title")}
        className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain p-2"
      >
        {groups.map(({ group, entries }) => {
          const Icon = GROUP_ICONS[group];
          const headingId = `${listId}-${group}`;
          return (
            <div
              key={group}
              role="group"
              aria-labelledby={headingId}
              className="pb-1"
            >
              <div
                id={headingId}
                className="px-3 pb-1 pt-3 text-sm font-semibold text-muted-foreground"
              >
                {t(`groups.${group}`)}
              </div>
              {entries.map(({ item, index }) => {
                const isActive = index === safeIndex;
                return (
                  <div
                    key={item.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isActive}
                    onMouseMove={() => {
                      if (!isActive) setActiveIndex(index);
                    }}
                    onClick={() => onSelect(item)}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-base ${
                      isActive ? "bg-surface" : ""
                    }`}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium" lang={item.lang}>
                        {item.label}
                      </span>
                      {item.detail && (
                        <span className="truncate text-sm text-muted-foreground">
                          {item.detail}
                        </span>
                      )}
                    </span>
                    {item.current && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {t("current")}
                      </span>
                    )}
                    {isActive && (
                      <CornerDownLeft
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {visible.length === 0 && !loading && (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            {t("empty", { query: query.trim() })}
          </p>
        )}
        {loading && (
          <p
            role="status"
            className="px-2 py-2 text-xs text-muted-foreground"
          >
            {t("searchingBlog")}
          </p>
        )}
      </div>

      <div className="hidden items-center gap-5 bg-surface px-5 py-3 text-sm text-muted-foreground sm:flex">
        <span className="flex items-center gap-1.5">
          <kbd className={KBD_CLASS}>↑</kbd>
          <kbd className={KBD_CLASS}>↓</kbd>
          {t("hintMove")}
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className={KBD_CLASS}>↵</kbd>
          {t("hintOpen")}
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className={KBD_CLASS}>Esc</kbd>
          {t("hintClose")}
        </span>
      </div>
    </>
  );
}
