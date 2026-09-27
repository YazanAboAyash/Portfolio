/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import {
  Briefcase,
  FolderGit2,
  Newspaper,
  Package,
  Scale,
  ShieldCheck,
} from "lucide-react";

/** Highlighted compliance cards, in display order. `key` maps to `About.compliance.*`. */
export const ABOUT_COMPLIANCE_ITEMS = [
  { key: "dsgvo", icon: ShieldCheck },
  { key: "aiAct", icon: Scale },
] as const;

/** Link buttons to the pages that already present the work. `key` maps to `About.explore.*`. */
export const ABOUT_EXPLORE_LINKS = [
  { key: "projects", href: "/projects", icon: FolderGit2 },
  { key: "products", href: "/#products", icon: Package },
  { key: "services", href: "/services", icon: Briefcase },
  { key: "blog", href: "/blog", icon: Newspaper },
] as const;
