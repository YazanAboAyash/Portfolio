/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

/**
 * Individual capability with business outcome focus
 */
export interface Capability {
  /** Unique identifier */
  readonly id: string;
  /** Icon identifier from lucide-react */
  readonly icon: string;
  /** Translation key for title */
  readonly titleKey: string;
  /** Translation key for headline/value proposition */
  readonly headlineKey: string;
  /** Translation key for description */
  readonly descriptionKey: string;
  /** Tech stack icon identifiers (react-icons/si or VscAzure) - subtle indicators */
  readonly techIcons?: readonly string[];
}

/** Row a technology sits in on the stack explorer */
export type StackGroup = "ai" | "frontend" | "backend" | "tooling";

/**
 * One technology on the stack explorer. Projects and products match it when
 * one of their `technologies` equals an alias (case-insensitive).
 */
export interface StackTech {
  /** Unique identifier, also the key under `Capabilities.explorer.tech` */
  readonly id: string;
  readonly group: StackGroup;
  /** Spellings used in projectsData / productsData */
  readonly aliases: readonly string[];
  /** How this site uses it, if it does (names and versions only) */
  readonly site?: string;
}

/**
 * Capabilities section data structure
 */
export interface CapabilitiesData {
  readonly capabilities: readonly Capability[];
}
