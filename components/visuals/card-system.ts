/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

/**
 * Single source of truth for card appearance on the home page.
 *
 * Every card shares the same surface, radius, shadow steps and 300ms timing.
 * Accent variants change only the hue of the border and hover glow, so featured
 * cards still read as featured without introducing a second hover language.
 */

/**
 * Surface, corners and timing shared by every card.
 *
 * v7: a card is a flat field one tone step above the page — no border, no
 * shadow, no blur, square corners. Hover lifts it one more step. `rounded-none
 * border-0 shadow-none` also override the Shadcn `Card` defaults through
 * tailwind-merge.
 *
 * The group is *named* (`group/card`) so children opt in with
 * `group-hover/card:`. Unnamed `group-hover:` inside a card — the screenshot
 * gallery's zoom, for one — stays bound to its own local group.
 */
const cardBase =
  "group/card bg-surface rounded-none border-0 shadow-none transition-colors duration-300 hover:bg-surface-2";

/** Default card. */
export const cardSurface = cardBase;

/** Featured card (e.g. the Botgenossen collaboration) — same field, inverted on hover. */
export const cardSurfaceFeatured = cardBase;

/** Inner padding wrapper of a card. Pairs with {@link cardSurface}. */
export const cardRail = "transition-colors duration-300";

/** Inner padding wrapper of a featured card. Pairs with {@link cardSurfaceFeatured}. */
export const cardRailFeatured = cardRail;
