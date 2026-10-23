/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type React from "react";

export interface TechStackItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  technologies: string[];
  metrics?: string;
  level?: number;
}

export interface ArchitectureNode {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  color: string;
}

export interface WorkflowStep {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}

export interface CodeExample {
  title: string;
  language: string;
  code: string;
}

export interface PerformanceMetric {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  items: string[];
  score: number;
}

export interface RouteGroup {
  name: string;
  description: string;
  routes: string[];
  layout: string;
}

export interface RouteStructure {
  rootLayout: {
    name: string;
    path: string;
    features: string[];
  };
  routeGroups: RouteGroup[];
  apiRoutes: string[];
}

export interface ComponentFile {
  folder: string;
  files?: string[];
  description?: string;
  examples?: string[];
}

export interface ComponentStructure {
  pattern: string;
  structure: ComponentFile[];
}
