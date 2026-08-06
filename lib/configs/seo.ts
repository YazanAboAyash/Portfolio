/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { Blog, BlogSEO, BlogStructuredData } from "@/types/hubs/blogs";
import type {
  SEOConfig,
  LegalPageType,
  MediaSectionType,
} from "@/types/configs/seo";
import {
  seoConfigEN,
  seoConfigDE,
  legalPageContent,
  mediaSectionContent,
} from "@/data/configs/seo";

// Re-export configurations for backward compatibility
export { seoConfigEN, seoConfigDE };

// Utility function to get config by locale
function getConfigByLocale(locale: string = "en"): SEOConfig {
  return locale === "de" ? seoConfigDE : seoConfigEN;
}

export function generateStructuredData(config: SEOConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: config.structured.name,
    jobTitle: config.structured.jobTitle,
    description: config.structured.description,
    url: config.siteUrl,
    image: `${config.siteUrl}${config.openGraph.image}`,
    email: config.structured.email,
    sameAs: [
      config.structured.github,
      ...(config.structured.linkedIn ? [config.structured.linkedIn] : []),
    ],
    knowsAbout: config.structured.skills,
    address: {
      "@type": "Place",
      name: config.structured.location,
    },
    worksFor: {
      "@type": "Organization",
      name: "Freelance",
    },
  };
}

/**
 * Generate SEO metadata for blog posts
 */
export function generateBlogSEO(blog: Blog, locale: string = "en"): BlogSEO {
  const config = getConfigByLocale(locale);
  const baseUrl = config.siteUrl;

  // Create title with fallback
  const blogTitle = blog.metaTitle || blog.title;
  const fullTitle = `${blogTitle} | ${config.siteName}`;

  // Create description with fallback
  const description =
    blog.metaDescription ||
    blog.excerpt ||
    `Read "${blog.title}" on ${config.siteName}. ${config.description}`;

  // Generate keywords from tags and categories
  const keywords = [
    ...config.keywords,
    ...(blog.tags?.map((tagRel) => tagRel.tag?.name).filter(Boolean) || []),
    blog.category?.name,
    blog.title.split(" ").slice(0, 3), // First 3 words of title
  ].filter(Boolean) as string[];

  // Canonical URL
  const canonicalUrl = `${baseUrl}/blog/${blog.slug}`;

  // Open Graph image with fallback
  const ogImage = blog.featuredImage || `${baseUrl}/og-blog-default.jpg`;

  return {
    title: fullTitle,
    description: description.slice(0, 160),
    keywords: [...new Set(keywords)],
    canonicalUrl,
    ogImage,
    ogTitle: blogTitle,
    ogDescription: description.slice(0, 200),
    twitterTitle: blogTitle,
    twitterDescription: description.slice(0, 120),
    twitterImage: ogImage,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.excerpt || blog.metaDescription || "",
      image: blog.featuredImage ? `${baseUrl}${blog.featuredImage}` : undefined,
      author: {
        "@type": "Person",
        name: config.structured.name,
        url: config.structured.github,
      },
      publisher: {
        "@type": "Organization",
        name: config.siteName,
        logo: `${baseUrl}/logo.png`,
      },
      datePublished:
        blog.publishedAt?.toISOString() || blog.createdAt.toISOString(),
      dateModified: blog.updatedAt.toISOString(),
      url: `${baseUrl}/blog/${blog.slug}`,
      mainEntityOfPage: `${baseUrl}/blog/${blog.slug}`,
      wordCount: blog.content.split(/\s+/).length,
      timeRequired: blog.readingTime ? `PT${blog.readingTime}M` : undefined,
      keywords: [
        ...(blog.tags?.map((tagRel) => tagRel.tag?.name).filter(Boolean) || []),
        blog.category?.name,
      ].filter((keyword): keyword is string => Boolean(keyword)),
      articleSection: blog.category?.name,
      about: blog.category?.description,
    } as BlogStructuredData,
  };
}

// Common metadata structure builder to reduce duplication
function buildCommonMetadata(
  title: string,
  description: string,
  keywords: string[],
  canonicalUrl: string,
  config: SEOConfig,
  imageUrl: string,
) {
  return {
    title: {
      absolute: `${title} | ${config.siteName}`,
    },
    description,
    keywords: [...config.keywords, ...keywords],
    authors: [{ name: config.author }],
    creator: config.author,
    publisher: config.siteName,
    metadataBase: new URL(config.siteUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: config.siteName,
      type: "website" as const,
      locale: config.locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - ${config.siteName}`,
        },
      ],
    },
    twitter: {
      card: config.twitter.cardType,
      title,
      description,
      creator: config.twitter.handle,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Generate SEO metadata for legal pages (privacy, terms, impressum)
 */
export function generateLegalPageSEO(
  pageType: LegalPageType,
  locale: string = "en",
) {
  const config = getConfigByLocale(locale);
  const currentLang = locale === "de" ? "de" : "en";
  const content = legalPageContent[pageType][currentLang];
  const canonicalUrl = `${config.siteUrl}${content.path}`;
  const imageUrl = `${config.siteUrl}/og-legal.jpg`;

  return buildCommonMetadata(
    content.title,
    content.description,
    content.keywords,
    canonicalUrl,
    config,
    imageUrl,
  );
}

/**
 * Generate SEO metadata for media section pages
 */
export function generateMediaSectionSEO(
  section: MediaSectionType,
  locale: string = "en",
) {
  const config = getConfigByLocale(locale);
  const currentLang = locale === "de" ? "de" : "en";
  const content = mediaSectionContent[section][currentLang];
  const canonicalUrl = `${config.siteUrl}${content.path}`;
  const imageUrl = `${config.siteUrl}/og-${section}.jpg`;

  return buildCommonMetadata(
    content.title,
    content.description,
    content.keywords,
    canonicalUrl,
    config,
    imageUrl,
  );
}
