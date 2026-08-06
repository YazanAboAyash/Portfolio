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
  | "webApplication"
  | "aiIntegration"
  | "automation"
  | "custom";

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
 * A priced add-on for a package
 */
export interface ServiceExtra {
  /** Translation key for the extra's label */
  readonly labelKey: string;
  /** Translation key for the extra's price */
  readonly priceKey: string;
}

/**
 * A scope boundary called out on the card — what a package does or does not
 * cover, so a client doesn't assume more than what's priced.
 */
export interface ServiceScopeNote {
  /** Translation key for the note's label, e.g. "Where I can add it" */
  readonly labelKey: string;
  /** Translation key for the note's body text */
  readonly textKey: string;
}

/**
 * Service package definition
 */
export interface ServicePackage {
  /** Unique identifier for the package */
  readonly id: ServicePackageId;
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
  /** Priced add-ons available for this package */
  readonly extras?: readonly ServiceExtra[];
  /** Scope boundary shown on the card (where it applies / what it excludes) */
  readonly scopeNote?: ServiceScopeNote;
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
 * Complete services page data structure
 */
export interface ServicesPageData {
  readonly packages: readonly ServicePackage[];
  readonly processSteps: readonly ProcessStep[];
  readonly bookingLink: string;
}
