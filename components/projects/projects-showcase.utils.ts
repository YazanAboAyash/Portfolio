/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UseProjectLogicReturn, Project } from "@/types/hubs/projects";

/**
 * Derives the GitHub social preview (OG) image URL from a repo URL.
 * Returns null when githubUrl is empty.
 */
export function getGithubOgImage(githubUrl: string): string | null {
  if (!githubUrl) return null;
  try {
    const { pathname } = new URL(githubUrl);
    // pathname = "/OWNER/REPO" — strip leading slash
    const path = pathname.replace(/^\//, "").replace(/\.git$/, "");
    if (!path || !path.includes("/")) return null;
    return `https://opengraph.githubassets.com/1/${path}`;
  } catch {
    return null;
  }
}

/**
 * Custom hook for handling project card logic
 */
export function useProjectLogic(): UseProjectLogicReturn {
  const [copied, setCopied] = useState(false);

  const handleCopyCloneLink = useCallback(async (githubUrl: string) => {
    const cloneLink = `git clone ${githubUrl}.git`;
    try {
      await navigator.clipboard.writeText(cloneLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }, []);

  return {
    handleCopyCloneLink,
    copied,
    setCopied,
  };
}

/**
 * Custom hook for handling text truncation detection
 */
export function useTruncationDetection(description: string) {
  const [isTruncated, setIsTruncated] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (descriptionRef.current) {
        const element = descriptionRef.current;
        setIsTruncated(element.scrollHeight > element.clientHeight);
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);

    return () => window.removeEventListener("resize", checkTruncation);
  }, [description]);

  return {
    isTruncated,
    descriptionRef,
  };
}

/**
 * Utility to check if a project is featured
 */
export function isFeaturedProject(project: Project): boolean {
  return project.featured;
}

/**
 * Utility to get license badge variant classes
 */
export function getLicenseBadgeClasses(licenseType?: string): string {
  switch (licenseType) {
    case "fully-open":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "copyright":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "mit":
    case "permissive":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case "gpl":
    case "copyleft":
    case "agpl":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
    case "apache":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
    case "proprietary":
    case "closed":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
  }
}

/**
 * Utility to get license emoji
 */
export function getLicenseEmoji(licenseType?: string): string {
  switch (licenseType) {
    case "copyright":
      return "©";
    case "fully-open":
      return "🌟";
    case "mit":
    case "permissive":
      return "🔵";
    case "gpl":
    case "copyleft":
    case "agpl":
      return "🔒";
    case "apache":
      return "🦅";
    case "proprietary":
    case "closed":
      return "🔐";
    default:
      return "🔓";
  }
}
