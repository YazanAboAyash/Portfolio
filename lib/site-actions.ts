/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { HOME_SECTION_IDS } from "@/data/configs/search";
import { SUPPORTED_LOCALES } from "@/data/configs/i18n";
import {
  HIGHLIGHTABLE_PROJECT_TITLES,
  NAVIGABLE_HREFS,
  SITE_THEMES,
} from "@/data/configs/site-actions";
import type { Project } from "@/data/hubs/projectsData";
import type { SiteAction } from "@/types/configs/site-actions";

/**
 * DOM id of a project's card on /projects. Products and projects share an id
 * space (LogiX and beRich.Hub are both 2), hence the kind in the id.
 */
export function projectAnchorId(project: Pick<Project, "id" | "commercial">) {
  return `work-${project.commercial ? "product" : "project"}-${project.id}`;
}

function isOneOf<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return (
    typeof value === "string" && (values as readonly string[]).includes(value)
  );
}

function field(input: unknown, key: string): unknown {
  if (typeof input !== "object" || input === null || !(key in input)) {
    return undefined;
  }
  return (input as Record<string, unknown>)[key];
}

/**
 * Reads a tool part back as a site action, or null when it is not one. The
 * server has already validated the input with zod; this repeats the check
 * against the same allowlists without shipping zod to the browser, and gives
 * the client a typed action to run or label.
 */
export function parseSiteAction(
  name: string,
  input: unknown,
): SiteAction | null {
  switch (name) {
    case "navigate": {
      const href = field(input, "href");
      return isOneOf(NAVIGABLE_HREFS, href) ? { name, input: { href } } : null;
    }
    case "scroll_to_section": {
      const section = field(input, "section");
      return isOneOf(HOME_SECTION_IDS, section)
        ? { name, input: { section } }
        : null;
    }
    case "set_theme": {
      const theme = field(input, "theme");
      return isOneOf(SITE_THEMES, theme) ? { name, input: { theme } } : null;
    }
    case "set_language": {
      const locale = field(input, "locale");
      return isOneOf(SUPPORTED_LOCALES, locale)
        ? { name, input: { locale } }
        : null;
    }
    case "highlight_project": {
      const title = field(input, "title");
      return isOneOf(HIGHLIGHTABLE_PROJECT_TITLES, title)
        ? { name, input: { title } }
        : null;
    }
    default:
      return null;
  }
}
