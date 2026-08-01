/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

/**
 * Single source of truth for card appearance on the home page.
 *
 * Every card shares the same surface, radius, shadow steps and 300ms timing.
 * Accent variants change only the hue of the border and hover glow, so featured
 * cards still read as featured without introducing a second hover language.
 */

/**
 * Surface, radius, shadow steps and timing shared by every card.
 *
 * The group is *named* (`group/card`) so children opt in with
 * `group-hover/card:`. Unnamed `group-hover:` inside a card — the screenshot
 * gallery's zoom, for one — stays bound to its own local group.
 */
const cardBase =
  "group/card bg-background/80 backdrop-blur-sm rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl";

/** Default card — neutral border, neutral hover. */
export const cardSurface = `${cardBase} border-border/50 hover:border-muted-foreground/30`;

/** Featured card (e.g. the Botgenossen collaboration) — amber accent. */
export const cardSurfaceFeatured = `${cardBase} border-amber-400/40 hover:border-amber-400/70 hover:shadow-amber-400/20`;

/** GitHub cards — blue accent, matching the GitHub section's identity. */
export const cardSurfaceGitHub = `${cardBase} border-blue-500/25 hover:border-blue-500/50 hover:shadow-blue-500/15`;

/** Left rail accent rendered inside a card. Pairs with {@link cardSurface}. */
export const cardRail =
  "border-l-2 border-foreground/20 group-hover/card:border-foreground/60 transition-colors duration-300";

/** Left rail accent for featured cards. Pairs with {@link cardSurfaceFeatured}. */
export const cardRailFeatured =
  "border-l-2 border-amber-400/30 group-hover/card:border-amber-400/70 transition-colors duration-300";
