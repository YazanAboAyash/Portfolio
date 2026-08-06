/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

export interface Achievement {
  title: string;
  description: string;
  date: string;
  category: "work" | "project" | "education" | "certification";
}

export interface SkillItem {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: "frontend" | "backend" | "fullstack" | "tools" | "soft-skills";
}

export interface AboutTranslations {
  aboutMe: string;
  getInTouch: string;
  downloadCV: string;
  philosophy: string;
  myDevelopmentPhilosophy: string;
  currentFocus: string;
  coreValues: string;
  whatDrivesMe: string;
  achievementsTitle: string;
  milestonesRecognition: string;
  personalInfo: {
    name: string;
    title: string;
    currentPosition: string;
    company: string;
    location: string;
    experience: string;
  };
  mainStory: string;
  workingWithMe: string;
  credentials: string;
  sections: {
    philosophy: string;
  };
  cta: {
    work: string;
    call: string;
  };
  currentFocusItems: string[];
  values: string[];
  achievements: Achievement[];
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
