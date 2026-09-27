/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type {
  ServicePackage,
  ProcessStep,
  ServicesPageData,
} from "@/types/hubs/services";

/**
 * Service packages with translation keys
 */
export const servicePackages: readonly ServicePackage[] = [
  {
    id: "website",
    nameKey: "packages.website.name",
    headlineKey: "packages.website.headline",
    descriptionKey: "packages.website.description",
    timelineKey: "packages.website.timeline",
    icon: "Globe",
    ctaKey: "packages.cta",
    features: [
      { textKey: "packages.website.features.pages", included: true },
      { textKey: "packages.website.features.businessInfo", included: true },
      { textKey: "packages.website.features.contact", included: true },
      { textKey: "packages.website.features.gbp", included: true },
      { textKey: "packages.website.features.legal", included: true },
      { textKey: "packages.website.features.seo", included: true },
    ],
    extras: [
      { labelKey: "packages.website.extras.page.label" },
      { labelKey: "packages.website.extras.section.label" },
      { labelKey: "packages.website.extras.secondLanguage.label" },
      { labelKey: "packages.website.extras.staticBlog.label" },
      { labelKey: "packages.website.extras.cmsBlog.label" },
      { labelKey: "packages.website.extras.consentBanner.label" },
      { labelKey: "packages.website.extras.textPrep.label" },
      { labelKey: "packages.website.extras.managedSetup.label" },
    ],
  },
  {
    id: "webApplication",
    nameKey: "packages.webApplication.name",
    headlineKey: "packages.webApplication.headline",
    descriptionKey: "packages.webApplication.description",
    timelineKey: "packages.webApplication.timeline",
    icon: "Database",
    ctaKey: "packages.cta",
    features: [
      { textKey: "packages.webApplication.features.website", included: true },
      {
        textKey: "packages.webApplication.features.database",
        included: true,
      },
      { textKey: "packages.webApplication.features.auth", included: true },
      {
        textKey: "packages.webApplication.features.adminView",
        included: true,
      },
      {
        textKey: "packages.webApplication.features.production",
        included: true,
      },
    ],
    extras: [
      { labelKey: "packages.webApplication.extras.booking.label" },
      { labelKey: "packages.webApplication.extras.roles.label" },
      { labelKey: "packages.webApplication.extras.sso.label" },
      { labelKey: "packages.webApplication.extras.payments.label" },
      { labelKey: "packages.webApplication.extras.fileUpload.label" },
      { labelKey: "packages.webApplication.extras.adminView.label" },
      { labelKey: "packages.webApplication.extras.notifications.label" },
      { labelKey: "packages.webApplication.extras.page.label" },
    ],
  },
  {
    id: "aiIntegration",
    nameKey: "packages.aiIntegration.name",
    headlineKey: "packages.aiIntegration.headline",
    descriptionKey: "packages.aiIntegration.description",
    timelineKey: "packages.aiIntegration.timeline",
    icon: "Brain",
    ctaKey: "packages.cta",
    scopeNote: {
      labelKey: "packages.aiIntegration.scopeNote.label",
      textKey: "packages.aiIntegration.scopeNote.text",
    },
    features: [
      { textKey: "packages.aiIntegration.features.chatbot", included: true },
      {
        textKey: "packages.aiIntegration.features.knowledgeBase",
        included: true,
      },
      {
        textKey: "packages.aiIntegration.features.transparency",
        included: true,
      },
      { textKey: "packages.aiIntegration.features.avv", included: true },
      {
        textKey: "packages.aiIntegration.features.integration",
        included: true,
      },
    ],
    extras: [
      { labelKey: "packages.aiIntegration.extras.rag.label" },
      { labelKey: "packages.aiIntegration.extras.existingApp.label" },
      { labelKey: "packages.aiIntegration.extras.agent.label" },
      { labelKey: "packages.aiIntegration.extras.voice.label" },
      { labelKey: "packages.aiIntegration.extras.cloudSetup.label" },
      { labelKey: "packages.aiIntegration.extras.localModel.label" },
      { labelKey: "packages.aiIntegration.extras.knowledgeSource.label" },
      { labelKey: "packages.aiIntegration.extras.retraining.label" },
    ],
  },
  {
    id: "automation",
    nameKey: "packages.automation.name",
    headlineKey: "packages.automation.headline",
    descriptionKey: "packages.automation.description",
    timelineKey: "packages.automation.timeline",
    icon: "Cog",
    ctaKey: "packages.cta",
    scopeNote: {
      labelKey: "packages.automation.scopeNote.label",
      textKey: "packages.automation.scopeNote.text",
    },
    features: [
      { textKey: "packages.automation.features.review", included: true },
      { textKey: "packages.automation.features.connection", included: true },
      { textKey: "packages.automation.features.triggers", included: true },
      { textKey: "packages.automation.features.handover", included: true },
      { textKey: "packages.automation.features.avv", included: true },
    ],
    extras: [
      { labelKey: "packages.automation.extras.workflow.label" },
      { labelKey: "packages.automation.extras.tool.label" },
      { labelKey: "packages.automation.extras.n8n.label" },
      { labelKey: "packages.automation.extras.agentic.label" },
      { labelKey: "packages.automation.extras.devTools.label" },
      { labelKey: "packages.automation.extras.customApi.label" },
    ],
  },
  {
    id: "custom",
    nameKey: "packages.custom.name",
    headlineKey: "packages.custom.headline",
    descriptionKey: "packages.custom.description",
    timelineKey: "packages.custom.timeline",
    icon: "Settings",
    ctaKey: "packages.cta",
    features: [
      { textKey: "packages.custom.features.workshop", included: true },
      { textKey: "packages.custom.features.roadmap", included: true },
      { textKey: "packages.custom.features.milestones", included: true },
      { textKey: "packages.custom.features.agnostic", included: true },
      { textKey: "packages.custom.features.handover", included: true },
      { textKey: "packages.custom.features.support", included: true },
    ],
  },
] as const;

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
    titleKey: "process.acceptance.title",
    descriptionKey: "process.acceptance.description",
    icon: "ClipboardCheck",
  },
  {
    step: 5,
    titleKey: "process.support.title",
    descriptionKey: "process.support.description",
    icon: "HeartHandshake",
  },
] as const;

/**
 * Complete services page data
 */
export const servicesPageData: ServicesPageData = {
  packages: servicePackages,
  processSteps: processSteps,
  contactLink: "mailto:contact@yazan-abo-ayash.de",
} as const;

export default servicesPageData;
