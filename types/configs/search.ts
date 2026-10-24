/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { Blog } from "@/types/hubs/blogs";

/** Result groups of the search palette, in display order. */
export type SearchGroupId = "pages" | "sections" | "work" | "blog" | "settings";

/** A page the palette links to; the label is a key in the `Navigation` messages. */
export interface SearchPage {
  href: string;
  labelKey: "home" | "work" | "about" | "blog" | "aboutSite" | "impressum" | "privacy";
}

/** One row in the palette, already translated and ready to run. */
export interface SearchResult {
  id: string;
  group: SearchGroupId;
  label: string;
  /** Second line: category, section, language code, excerpt. */
  detail?: string;
  /** Extra text matched against the query but not shown. */
  keywords?: string;
  /** Marks the active theme or language. */
  current?: boolean;
  /** `lang` of the label, for language names. */
  lang?: string;
  run: () => void;
}

/** The fields of a published post the palette shows. */
export type BlogSearchHit = Pick<Blog, "id" | "title" | "slug" | "excerpt">;
