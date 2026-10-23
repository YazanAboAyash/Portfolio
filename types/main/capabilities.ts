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
  /** Tech stack icon identifiers (react-icons/si) - subtle indicators */
  readonly techIcons?: readonly string[];
}

/**
 * Capabilities section data structure
 */
export interface CapabilitiesData {
  readonly capabilities: readonly Capability[];
}
