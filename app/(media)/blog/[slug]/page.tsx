/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { BlogView } from "@/components/blog";
import { generateBlogSEO } from "@/lib/configs/seo";
import { getBlogBySlug } from "@/lib/hubs/blogs";

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;

  let blog;
  try {
    blog = await getBlogBySlug(slug);
  } catch (error) {
    console.error("Failed to load blog:", error);
    notFound();
  }

  if (!blog) {
    notFound();
  }

  return (
    <div className="frame pt-6 pb-16 md:pt-10 md:pb-24">
      {/* Reading column plus the "On this page" rail from lg up */}
      <BlogView blog={blog} className="mx-auto max-w-6xl" />
    </div>
  );
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const locale = await getLocale();
    const blog = await getBlogBySlug(slug);

    if (!blog) {
      return {
        title: "Blog Not Found",
      };
    }

    const seo = generateBlogSEO(blog, locale);

    return {
      title: { absolute: seo.title },
      description: seo.description,
      keywords: seo.keywords,
      alternates: {
        canonical: seo.canonicalUrl,
      },
      openGraph: {
        title: seo.ogTitle ?? seo.title,
        description: seo.ogDescription ?? seo.description,
        url: seo.canonicalUrl,
        images: seo.ogImage ? [seo.ogImage] : undefined,
      },
      twitter: {
        title: seo.twitterTitle ?? seo.title,
        description: seo.twitterDescription ?? seo.description,
        images: seo.twitterImage ? [seo.twitterImage] : undefined,
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata:", error);
    return {
      title: "Blog",
      description: "Blog content",
    };
  }
}
