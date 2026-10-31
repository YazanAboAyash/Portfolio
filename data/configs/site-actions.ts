/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { SEARCH_PAGES } from "@/data/configs/search";
import { productProjects, projects } from "@/data/hubs/projectsData";
import type { SiteActionName } from "@/types/configs/site-actions";

/**
 * The UI actions Reem can take, as tools. The chat route validates each input
 * against the allowlists below and only acknowledges the call; the browser
 * carries it out (`hooks/use-site-actions.ts`). Not exposed by the MCP server.
 */
export const SITE_ACTION_NAMES = [
  "navigate",
  "scroll_to_section",
  "set_theme",
  "set_language",
  "highlight_project",
] as const satisfies readonly SiteActionName[];

/** Model-facing, so English only and never shown to visitors. */
export const SITE_ACTION_DESCRIPTIONS: Record<SiteActionName, string> = {
  navigate:
    "Open one of this site's pages in the visitor's browser. Only when the visitor asks to go there.",
  scroll_to_section:
    "Scroll the visitor to a section of the home page, opening the home page first if needed. Only when the visitor asks to see it.",
  set_theme:
    "Switch the site between light and dark mode. Only when the visitor asks for it.",
  set_language:
    "Switch the site's interface language. Only when the visitor asks for it.",
  highlight_project:
    "Open the Projects page, scroll to one project or product card and highlight it. Pass its exact title. Only when the visitor asks to see it.",
};

export const SITE_THEMES = ["light", "dark"] as const;

export const NAVIGABLE_HREFS: readonly string[] = SEARCH_PAGES.map(
  (page) => page.href,
);

/** Every card on /projects, in the order `ProjectsShowcase` renders them. */
export const HIGHLIGHTABLE_PROJECTS = [...productProjects, ...projects];

export const HIGHLIGHTABLE_PROJECT_TITLES: readonly string[] =
  HIGHLIGHTABLE_PROJECTS.map((project) => project.title);

/** Sticky navbar height (h-16) plus air, matching the SectionRail jump. */
export const SECTION_SCROLL_OFFSET = 80;

/** How long a highlighted project card keeps its ring. */
export const HIGHLIGHT_DURATION_MS = 2400;

/** How long to wait for a project card to mount after navigating to /projects. */
export const HIGHLIGHT_WAIT_MS = 4000;
