/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type React from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface ResponsiveConfig {
  deviceType: DeviceType;
  containerClasses: string;
  cardClasses: string;
  featuresConfig: {
    features: PortoCardFeature[];
    showAll: boolean;
  };
}

export interface PortoCardFeature {
  key: string;
  icon: React.ReactNode;
  badges: string[];
  priority: number;
}

export interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badges?: string[];
  compact?: boolean;
}

export interface PortoCardProps {
  className?: string;
}
