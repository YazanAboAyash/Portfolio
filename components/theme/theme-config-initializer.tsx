/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

// OLD CONFIG - Commented out to prevent crashes when NEXT_PUBLIC_THEME_SIGNATURE_KEY
// and NEXT_PUBLIC_THEME_VALIDATION_HASH env variables are missing in development mode.
// Uncomment if you have those env variables set properly.
//
import { initializeThemeConfig } from "./theme-config-validator";
import { useEffect } from "react";
//
export function ThemeConfigInitializer() {
  useEffect(() => {
    initializeThemeConfig();
  }, []);
  return null;
}

/**
 * NEW CONFIG - Safe version that doesn't require env variables
 * Client-side CSS performance initialization component
 */
/* export function ThemeConfigInitializer() {
  // Theme config initialization disabled for development stability
  // Enable the old config above if you have the required env variables
  return null;
} */
