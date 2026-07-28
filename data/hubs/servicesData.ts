/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type {
  ServicePackage,
  ServiceTier,
  ProcessStep,
  TrustSignal,
  ServicesPageData,
} from "@/types/hubs/services";
import { serviceTierOrder } from "@/types/hubs/services";

/**
 * Service packages with translation keys
 */
export const servicePackages: readonly ServicePackage[] = [
  {
    id: "website",
    tier: "starter",
    nameKey: "packages.website.name",
    headlineKey: "packages.website.headline",
    descriptionKey: "packages.website.description",
    pricingKey: "packages.website.pricing",
    timelineKey: "packages.website.timeline",
    icon: "Globe",
    ctaKey: "packages.cta",
    features: [
      { textKey: "packages.website.features.design", included: true },
      { textKey: "packages.website.features.compliant", included: true },
      { textKey: "packages.website.features.gbp", included: true },
      { textKey: "packages.website.features.contact", included: true },
      { textKey: "packages.website.features.goLive", included: true },
      { textKey: "packages.website.features.ownership", included: true },
    ],
  },
  {
    id: "chatbotStarter",
    tier: "starter",
    nameKey: "packages.chatbotStarter.name",
    headlineKey: "packages.chatbotStarter.headline",
    descriptionKey: "packages.chatbotStarter.description",
    pricingKey: "packages.chatbotStarter.pricing",
    timelineKey: "packages.chatbotStarter.timeline",
    icon: "Bot",
    ctaKey: "packages.cta",
    features: [
      { textKey: "packages.chatbotStarter.features.website", included: true },
      { textKey: "packages.chatbotStarter.features.chatbot", included: true },
      {
        textKey: "packages.chatbotStarter.features.availability",
        included: true,
      },
      {
        textKey: "packages.chatbotStarter.features.transparency",
        included: true,
      },
      { textKey: "packages.chatbotStarter.features.handover", included: true },
      { textKey: "packages.chatbotStarter.features.ownership", included: true },
    ],
  },
  {
    id: "automationStarter",
    tier: "starter",
    nameKey: "packages.automationStarter.name",
    headlineKey: "packages.automationStarter.headline",
    descriptionKey: "packages.automationStarter.description",
    pricingKey: "packages.automationStarter.pricing",
    timelineKey: "packages.automationStarter.timeline",
    icon: "Zap",
    ctaKey: "packages.cta",
    features: [
      {
        textKey: "packages.automationStarter.features.booking",
        included: true,
      },
      {
        textKey: "packages.automationStarter.features.replies",
        included: true,
      },
      { textKey: "packages.automationStarter.features.setup", included: true },
      {
        textKey: "packages.automationStarter.features.handover",
        included: true,
      },
      {
        textKey: "packages.automationStarter.features.ownership",
        included: true,
      },
    ],
  },
  {
    id: "mvp",
    tier: "advanced",
    nameKey: "packages.mvp.name",
    headlineKey: "packages.mvp.headline",
    descriptionKey: "packages.mvp.description",
    pricingKey: "packages.mvp.pricing",
    timelineKey: "packages.mvp.timeline",
    icon: "Rocket",
    ctaKey: "packages.cta",
    features: [
      { textKey: "packages.mvp.features.fullStack", included: true },
      { textKey: "packages.mvp.features.responsive", included: true },
      { textKey: "packages.mvp.features.database", included: true },
      { textKey: "packages.mvp.features.auth", included: true },
      { textKey: "packages.mvp.features.deployment", included: true },
      { textKey: "packages.mvp.features.support", included: true },
    ],
  },
  {
    id: "automation",
    tier: "advanced",
    nameKey: "packages.automation.name",
    headlineKey: "packages.automation.headline",
    descriptionKey: "packages.automation.description",
    pricingKey: "packages.automation.pricing",
    timelineKey: "packages.automation.timeline",
    icon: "Cog",
    ctaKey: "packages.cta",
    features: [
      { textKey: "packages.automation.features.analysis", included: true },
      { textKey: "packages.automation.features.integration", included: true },
      { textKey: "packages.automation.features.workflows", included: true },
      { textKey: "packages.automation.features.documentation", included: true },
      { textKey: "packages.automation.features.training", included: true },
      { textKey: "packages.automation.features.support", included: true },
    ],
  },
  {
    id: "ai",
    tier: "advanced",
    nameKey: "packages.ai.name",
    headlineKey: "packages.ai.headline",
    descriptionKey: "packages.ai.description",
    pricingKey: "packages.ai.pricing",
    timelineKey: "packages.ai.timeline",
    icon: "Brain",
    ctaKey: "packages.cta",
    features: [
      { textKey: "packages.ai.features.chatbot", included: true },
      { textKey: "packages.ai.features.rag", included: true },
      { textKey: "packages.ai.features.integration", included: true },
      { textKey: "packages.ai.features.security", included: true },
      { textKey: "packages.ai.features.training", included: true },
      { textKey: "packages.ai.features.support", included: true },
    ],
  },
  {
    id: "custom",
    tier: "custom",
    nameKey: "packages.custom.name",
    headlineKey: "packages.custom.headline",
    descriptionKey: "packages.custom.description",
    pricingKey: "packages.custom.pricing",
    timelineKey: "packages.custom.timeline",
    icon: "Settings",
    ctaKey: "packages.cta",
    features: [
      { textKey: "packages.custom.features.scoping", included: true },
      { textKey: "packages.custom.features.roadmap", included: true },
      { textKey: "packages.custom.features.development", included: true },
      { textKey: "packages.custom.features.flexibility", included: true },
      { textKey: "packages.custom.features.handover", included: true },
      { textKey: "packages.custom.features.support", included: true },
    ],
  },
] as const;

/**
 * Packages grouped by tier, in display order. Empty tiers are dropped.
 */
export const packagesByTier: readonly {
  readonly tier: ServiceTier;
  readonly packages: readonly ServicePackage[];
}[] = serviceTierOrder
  .map((tier) => ({
    tier,
    packages: servicePackages.filter((pkg) => pkg.tier === tier),
  }))
  .filter((group) => group.packages.length > 0);

/**
 * Process workflow steps
 */
export const processSteps: readonly ProcessStep[] = [
  {
    step: 1,
    titleKey: "process.discovery.title",
    descriptionKey: "process.discovery.description",
    icon: "MessageSquare",
  },
  {
    step: 2,
    titleKey: "process.strategy.title",
    descriptionKey: "process.strategy.description",
    icon: "Target",
  },
  {
    step: 3,
    titleKey: "process.development.title",
    descriptionKey: "process.development.description",
    icon: "Code",
  },
  {
    step: 4,
    titleKey: "process.support.title",
    descriptionKey: "process.support.description",
    icon: "HeartHandshake",
  },
] as const;

/**
 * Trust signals / benefits
 */
export const trustSignals: readonly TrustSignal[] = [
  {
    id: "dynamic",
    titleKey: "trust.dynamic.title",
    descriptionKey: "trust.dynamic.description",
    icon: "Database",
  },
  {
    id: "scalable",
    titleKey: "trust.scalable.title",
    descriptionKey: "trust.scalable.description",
    icon: "TrendingUp",
  },
  {
    id: "reliable",
    titleKey: "trust.reliable.title",
    descriptionKey: "trust.reliable.description",
    icon: "Shield",
  },
  {
    id: "integrated",
    titleKey: "trust.integrated.title",
    descriptionKey: "trust.integrated.description",
    icon: "Plug",
  },
] as const;

/**
 * Complete services page data
 */
export const servicesPageData: ServicesPageData = {
  packages: servicePackages,
  processSteps: processSteps,
  trustSignals: trustSignals,
  bookingLink: "https://calendly.com/abo-ayash-yazan/intro-call",
} as const;

export default servicesPageData;
