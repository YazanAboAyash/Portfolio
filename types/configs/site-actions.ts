/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { HOME_SECTION_IDS } from "@/data/configs/search";
import type { SITE_THEMES } from "@/data/configs/site-actions";
import type { SupportedLocale } from "@/types/configs/i18n";

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export type SiteTheme = (typeof SITE_THEMES)[number];

/**
 * One thing Reem can do in the visitor's browser, with its input already
 * checked against the allowlists in `data/configs/site-actions.ts`.
 */
export type SiteAction =
  | { name: "navigate"; input: { href: string } }
  | { name: "scroll_to_section"; input: { section: HomeSectionId } }
  | { name: "set_theme"; input: { theme: SiteTheme } }
  | { name: "set_language"; input: { locale: SupportedLocale } }
  | { name: "highlight_project"; input: { title: string } };

export type SiteActionName = SiteAction["name"];
