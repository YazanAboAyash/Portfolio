/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { SearchGroupId, SearchPage } from "@/types/configs/search";

export const SEARCH_GROUPS: readonly SearchGroupId[] = [
  "pages",
  "sections",
  "work",
  "blog",
  "settings",
];

export const SEARCH_PAGES: readonly SearchPage[] = [
  { href: "/", labelKey: "home" },
  { href: "/projects", labelKey: "work" },
  { href: "/about", labelKey: "about" },
  { href: "/blog", labelKey: "blog" },
  { href: "/about-portfolio", labelKey: "aboutSite" },
  { href: "/impressum", labelKey: "impressum" },
  { href: "/privacy", labelKey: "privacy" },
];

/** Home page anchor ids in document order; labels come from `SectionRail.sections`. */
export const HOME_SECTION_IDS = [
  "home",
  "speed-insight",
  "collaboration",
  "projects",
  "products",
  "cert",
  "github",
  "capabilities",
] as const;

/** Queries shorter than this don't hit the blog API. */
export const BLOG_SEARCH_MIN_LENGTH = 2;

export const BLOG_SEARCH_LIMIT = 5;

/** Wait after the last keystroke before asking the blog API. */
export const BLOG_SEARCH_DEBOUNCE_MS = 250;
