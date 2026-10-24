/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { BlogView, BlogBreadcrumb } from "@/components/blog";
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
    <div className="frame pt-4 pb-16 sm:pt-6 md:pt-10 md:pb-24">
      {/* One reading column; the breadcrumb sits on its edge */}
      <div className="mx-auto max-w-4xl">
        <BlogBreadcrumb blog={blog} className="mb-8" />

        <BlogView blog={blog} />
      </div>
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
