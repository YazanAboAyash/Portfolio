/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { HomeContent } from "@/components/hero";
import { generateHomeSEO } from "@/lib/configs/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return generateHomeSEO(locale);
}

export default function Home() {
  return <HomeContent />;
}
