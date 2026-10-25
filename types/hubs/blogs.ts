/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

// Core Blog Types
export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;

  // Language support
  language: string; // ISO 639-1 language code (en, de, es, fr, sv, etc.)

  // Metadata
  isPublished: boolean;
  isFeatured: boolean;
  isDraft: boolean;
  license: string; // One of BLOG_LICENSE_TYPES

  // SEO
  metaTitle?: string;
  metaDescription?: string;

  // Stats
  readCount: number;
  readingTime?: number;

  // Dates
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  categoryId?: string;
  category?: BlogCategory;
  credits?: BlogCredit;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  blogs?: Blog[];
}

export interface BlogCredit {
  id: string;
  blogId: string;
  originalAuthor: string;
  originalSource?: string;
  sourceUrl?: string;
  creditText?: string;
  translatedFrom?: string;
  adaptedFrom?: string;
  createdAt: Date;
  updatedAt: Date;
  blog?: Blog;
}

// API Request/Response Types
export interface CreateBlogRequest {
  title: string;
  slug?: string; // Auto-generated if not provided
  excerpt?: string;
  content: string;
  featuredImage?: string;
  language?: BlogLanguage; // Defaults to "en" if not provided
  categoryId?: string;
  license?: BlogLicenseType; // Defaults to "All Rights Reserved"
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  publishedAt?: Date;
  credits?: Omit<BlogCredit, "id" | "blogId" | "createdAt" | "updatedAt">;
}

export interface UpdateBlogRequest {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  language?: BlogLanguage;
  categoryId?: string;
  license?: BlogLicenseType;
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isDraft?: boolean;
  publishedAt?: Date;
  credits?: Omit<BlogCredit, "id" | "blogId" | "createdAt" | "updatedAt">;
}

export interface BlogListQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  language?: BlogLanguage;
  published?: boolean;
  featured?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "publishedAt" | "readCount" | "title";
  sortOrder?: "asc" | "desc";
}

export interface BlogListResponse {
  blogs: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    categories: BlogCategory[];
  };
}

export interface BlogStatsResponse {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  featuredBlogs: number;
  totalReadCount: number;
  categoriesCount: number;
  topCategories: Array<{
    category: BlogCategory;
    blogCount: number;
  }>;
  popularBlogs: Array<{
    blog: Blog;
    readCount: number;
  }>;
  recentBlogs: Blog[];
}

/** An `##` heading in a post, as listed in the "On this page" rail. */
export interface BlogHeading {
  id: string;
  title: string;
}

// SEO and Meta Types
export interface BlogSEO {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData: BlogStructuredData;
}

export interface BlogStructuredData {
  "@context": "https://schema.org";
  "@type": "BlogPosting" | "Article";
  headline: string;
  description: string;
  image?: string | undefined;
  author: {
    "@type": "Person";
    name: string;
    url?: string | undefined;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo?: string | undefined;
  };
  datePublished: string;
  dateModified: string;
  url?: string | undefined;
  mainEntityOfPage?: string | undefined;
  wordCount?: number | undefined;
  timeRequired?: string | undefined;
  articleSection?: string | undefined;
  about?: string | undefined;
  keywords?: string[] | undefined;
}

// Utility Types
export type BlogStatus = "draft" | "published" | "featured";
export type BlogSortField =
  | "createdAt"
  | "updatedAt"
  | "publishedAt"
  | "readCount"
  | "title";
export type BlogSortOrder = "asc" | "desc";

// Error Types
export interface BlogError {
  code: string;
  message: string;
  field?: string;
}

export interface BlogApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: BlogError;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// Form Types for Admin/CMS
export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categoryId: string;
  license: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string; // ISO string format for forms
  credits?: {
    originalAuthor: string;
    originalSource: string;
    sourceUrl: string;
    creditText: string;
    translatedFrom: string;
    adaptedFrom: string;
  };
}

export interface BlogFormValidation {
  title: string[];
  slug: string[];
  content: string[];
  categoryId: string[];
  metaTitle: string[];
  metaDescription: string[];
  [key: string]: string[];
}

// Blog Language Support
export const SUPPORTED_BLOG_LANGUAGES = [
  "en", // English
  "de", // German
  "es", // Spanish
  "fr", // French
  "sv", // Swedish
] as const;

export type BlogLanguage = (typeof SUPPORTED_BLOG_LANGUAGES)[number];

export const BLOG_LANGUAGE_NAMES: Record<BlogLanguage, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  sv: "Svenska",
} as const;

// Constants
export const BLOG_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_EXCERPT_LENGTH: 300,
  MAX_META_TITLE_LENGTH: 60,
  MAX_META_DESCRIPTION_LENGTH: 160,
  MIN_CONTENT_LENGTH: 100,
  MAX_SLUG_LENGTH: 50,
  MAX_TAGS_PER_BLOG: 10,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * An array of supported blog license types.
 * 
 * - "CC BY": Creative Commons Attribution; allows redistribution and adaptation with attribution.
 * - "CC BY-SA": Creative Commons Attribution-ShareAlike; same as CC BY, but adaptations must be shared under the same terms.
 * - "CC BY-NC": Creative Commons Attribution-NonCommercial; allows non-commercial use with attribution.
 * - "CC BY-NC-SA": Creative Commons Attribution-NonCommercial-ShareAlike; non-commercial use, share alike, with attribution.
 * - "CC BY-ND": Creative Commons Attribution-NoDerivs; redistribution allowed, no derivatives, with attribution.
 * - "CC BY-NC-ND": Creative Commons Attribution-NonCommercial-NoDerivs; non-commercial redistribution, no derivatives, with attribution.
 * - "MIT": MIT License; permissive, allows reuse with attribution.
 * - "Apache 2.0": Apache License 2.0; permissive, includes patent rights, requires attribution.
 * - "GPL": GNU General Public License; copyleft, derivatives must be open source under GPL.
 * - "Fair Use": Use permitted under fair use doctrine; limited by law, not a license.
 * - "All Rights Reserved": No rights granted; all rights retained by the author.
 * - "Custom": Custom license specified by the author.
 */
export const BLOG_LICENSE_TYPES = [
  "CC BY",
  "CC BY-SA",
  "CC BY-NC",
  "CC BY-NC-SA",
  "CC BY-ND",
  "CC BY-NC-ND",
  "MIT",
  "Apache 2.0",
  "GPL",
  "Fair Use",
  "All Rights Reserved",
  "Custom",
] as const;

export type BlogLicenseType = (typeof BLOG_LICENSE_TYPES)[number];