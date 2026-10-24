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
    <div className="container mx-auto px-4 py-8">
      <ProjectsShowcase className="py-8 px-4 sm:px-6 lg:px-8" />
    </div>
  );
}
