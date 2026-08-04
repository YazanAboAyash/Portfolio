/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { BlogPageClient } from "@/components/blog";
import { generateMediaSectionSEO } from "@/lib/configs/seo";
import { getBlogs } from "@/lib/hubs/blogs";

export const revalidate = 60;

export default async function BlogsPage() {
  let blogs: Awaited<ReturnType<typeof getBlogs>>["blogs"] = [];

  try {
    const result = await getBlogs({ published: true });
    blogs = result.blogs;
  } catch (error) {
    console.error("Failed to load blogs:", error);
  }

  return <BlogPageClient initialBlogs={blogs} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return generateMediaSectionSEO("blog", locale);
}
