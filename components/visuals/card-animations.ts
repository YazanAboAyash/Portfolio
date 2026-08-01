/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

// Shared card hover styles
const cardHoverStyles = {
  base: "border-gray-500/50 bg-white shadow-2xl",
  themed:
    "dark:bg-black dark:shadow-blue-200/20 dark:border-blue-500/50 bg-white shadow-blue-200/20",
};

// Unified gradient overlay configuration for both themes
const gradientOverlay = {
  backgroundImage: `linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.08) 50%, transparent 70%),
                   linear-gradient(-45deg, transparent 30%, rgba(147, 197, 253, 0.08) 50%, transparent 70%)`,
};

// Animation configuration (only for hover-capable devices)
const cardAnimation = {
  backgroundSize: "200% 200%",
  animation: "gradient-shift 3s ease infinite",
};

// Check if device supports hover
const supportsHover = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover)").matches;
};

// Helper function to get card class names
export const getCardHoverClasses = (isHovered: boolean) => {
  return `
    relative overflow-hidden transition-all duration-500 ease-out group
    ${isHovered ? cardHoverStyles.base : ""}
    ${isHovered ? cardHoverStyles.themed : ""}
  `;
};

// Helper function to get overlay styles (disabled on touch devices)
export const getOverlayStyles = (isHovered: boolean) => {
  if (!isHovered || !supportsHover()) return { backgroundImage: "none" };

  return {
    ...gradientOverlay,
    ...cardAnimation,
  };
};
