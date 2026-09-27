/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

export interface SkillItem {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: "frontend" | "backend" | "fullstack" | "tools" | "soft-skills";
}

export interface AboutComplianceItem {
  label: string;
  title: string;
  description: string;
}

export interface AboutTranslations {
  badge: string;
  personalInfo: {
    name: string;
    title: string;
  };
  intro: string;
  focusTitle: string;
  currentFocusItems: string[];
  story: {
    title: string;
    paragraphs: string[];
  };
  compliance: {
    title: string;
    subtitle: string;
    dsgvo: AboutComplianceItem;
    aiAct: AboutComplianceItem;
    note: string;
  };
  workingWithMe: {
    title: string;
    items: string[];
  };
  availability: {
    title: string;
    description: string;
  };
  explore: {
    title: string;
    projects: string;
    products: string;
    services: string;
    blog: string;
  };
  cta: {
    contact: string;
  };
}

export interface LocaleMessages {
  [key: string]: unknown;
}

export interface LocaleModule {
  default: LocaleMessages;
}

export interface Translations {
  Hero: {
    availableForCollaboration: string;
    fullStackDeveloper: string;
    description: string;
    learnMoreAboutMe: string;
    moreAboutMe: string;
  };
  Navigation: {
    home: string;
    about: string;
    projects: string;
    mcp: string;
    technologies: string;
    certifications: string;
    navigation: string;
    impressum: string;
    legal: string;
  };
  About: AboutTranslations;
  [key: string]: unknown;
}
