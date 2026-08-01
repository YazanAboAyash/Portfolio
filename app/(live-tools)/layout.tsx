/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { generateLegalPageSEO } from "@/lib/configs/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return generateLegalPageSEO("privacy", locale);
}

export default function LegalsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
