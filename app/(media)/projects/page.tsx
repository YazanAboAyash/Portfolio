/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { ProjectsShowcase } from "@/components/projects";
import { generateMediaSectionSEO } from "@/lib/configs/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return generateMediaSectionSEO("projects", locale);
}

export default function LibraryPage() {
  return (
    <ProjectsShowcase className="frame pt-4 pb-16 sm:pt-6 md:pt-10 md:pb-24" />
  );
}
