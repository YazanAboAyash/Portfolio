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

/**
 * One stage of the shipping pipeline on the capabilities section, in the
 * order a change takes from commit to production.
 */
export interface PipelineStage {
  /** Unique identifier, also the key under `Capabilities.pipeline.stages` */
  readonly id: string;
  /** Capability this stage demonstrates, by `Capability.id` */
  readonly capabilityId?: string;
}

/** One tool in the stack explorer */
export interface StackTool {
  /** Unique identifier */
  readonly id: string;
  /** Product name in plain English, never translated */
  readonly name: string;
  /** Brand mark, by key in the tech icon map */
  readonly icon?: string;
}

/** A tab of the stack explorer */
export interface StackGroup {
  /** Key under `Capabilities.stack.groups` */
  readonly id: string;
  readonly tools: readonly StackTool[];
  /** Methods rather than tools, in plain English, untranslated */
  readonly practices: readonly string[];
}

/**
 * Capabilities section data structure
 */
export interface CapabilitiesData {
  readonly capabilities: readonly Capability[];
}
