/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";
import {
  HIGHLIGHT_DURATION_MS,
  HIGHLIGHT_WAIT_MS,
  HIGHLIGHTABLE_PROJECTS,
  SECTION_SCROLL_OFFSET,
} from "@/data/configs/site-actions";
import { projectAnchorId } from "@/lib/site-actions";
import type { SiteAction } from "@/types/configs/site-actions";

/**
 * Moves around the site and changes its settings. Shared by the search palette
 * and Reem, who runs these when the chat route acknowledges a site action.
 */
export function useSiteActions() {
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  return useMemo(() => {
    const scrollToElement = (target: HTMLElement) => {
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_OFFSET,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };

    const goToPage = (href: string) => {
      if (pathname !== href) router.push(href);
    };

    const goToSection = (id: string) => {
      if (pathname !== "/") {
        router.push(`/#${id}`);
        return;
      }
      const target = document.getElementById(id);
      if (target) scrollToElement(target);
    };

    const switchLocale = (next: string) => {
      // Same cookie the language menu writes; see LanguageSwitcher. Assigned
      // through a function, as there, to avoid the direct mutation warning.
      const setCookie = (value: string) => {
        document.cookie = value;
      };
      setCookie(`PORTFOLIOVERSIONLATEST_LOCALE=${next}; path=/;`);
      router.refresh();
    };

    // The card only exists on /projects, so after navigating there it is
    // polled for until the page has rendered it.
    const highlightProject = (title: string) => {
      const project = HIGHLIGHTABLE_PROJECTS.find((p) => p.title === title);
      if (!project) return;

      const anchorId = projectAnchorId(project);
      if (pathname !== "/projects") router.push("/projects");

      const deadline = performance.now() + HIGHLIGHT_WAIT_MS;
      const highlight = () => {
        const card = document.getElementById(anchorId);
        if (!card) {
          if (performance.now() < deadline) requestAnimationFrame(highlight);
          return;
        }
        scrollToElement(card);
        card.setAttribute("data-highlighted", "");
        window.setTimeout(
          () => card.removeAttribute("data-highlighted"),
          HIGHLIGHT_DURATION_MS,
        );
      };
      requestAnimationFrame(highlight);
    };

    const run = (action: SiteAction) => {
      switch (action.name) {
        case "navigate":
          goToPage(action.input.href);
          break;
        case "scroll_to_section":
          goToSection(action.input.section);
          break;
        case "set_theme":
          setTheme(action.input.theme);
          break;
        case "set_language":
          switchLocale(action.input.locale);
          break;
        case "highlight_project":
          highlightProject(action.input.title);
          break;
      }
    };

    return { goToPage, goToSection, switchLocale, setTheme, run };
  }, [router, pathname, setTheme, reduceMotion]);
}
