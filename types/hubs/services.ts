/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

/**
 * Service package identifier
 */
export type ServicePackageId =
  | "website"
  | "chatbotStarter"
  | "automationStarter"
  | "mvp"
  | "automation"
  | "ai"
  | "custom";

/**
 * Tier a package belongs to — drives grouping and the card badge
 */
export type ServiceTier = "starter" | "advanced" | "custom";

/**
 * Tier display order on the services page
 */
export const serviceTierOrder: readonly ServiceTier[] = [
  "starter",
  "advanced",
  "custom",
] as const;

/**
 * Individual feature/deliverable within a package
 */
export interface ServiceFeature {
  /** Translation key for the feature text */
  readonly textKey: string;
  /** Whether this feature is included in the package */
  readonly included: boolean;
}

/**
 * Service package definition
 */
export interface ServicePackage {
  /** Unique identifier for the package */
  readonly id: ServicePackageId;
  /** Tier this package belongs to */
  readonly tier: ServiceTier;
  /** Translation key for package name */
  readonly nameKey: string;
  /** Translation key for package headline */
  readonly headlineKey: string;
  /** Translation key for package description */
  readonly descriptionKey: string;
  /** Translation key for pricing display */
  readonly pricingKey: string;
  /** Translation key for timeline */
  readonly timelineKey: string;
  /** Icon identifier */
  readonly icon: string;
  /** List of features included */
  readonly features: readonly ServiceFeature[];
  /** CTA button translation key */
  readonly ctaKey: string;
}

/**
 * Process step in the workflow
 */
export interface ProcessStep {
  /** Step number (1-4) */
  readonly step: number;
  /** Translation key for step title */
  readonly titleKey: string;
  /** Translation key for step description */
  readonly descriptionKey: string;
  /** Icon identifier */
  readonly icon: string;
}

/**
 * Trust signal/benefit item
 */
export interface TrustSignal {
  /** Unique identifier */
  readonly id: string;
  /** Translation key for title */
  readonly titleKey: string;
  /** Translation key for description */
  readonly descriptionKey: string;
  /** Icon identifier */
  readonly icon: string;
}

/**
 * Complete services page data structure
 */
export interface ServicesPageData {
  readonly packages: readonly ServicePackage[];
  readonly processSteps: readonly ProcessStep[];
  readonly trustSignals: readonly TrustSignal[];
  readonly bookingLink: string;
}
