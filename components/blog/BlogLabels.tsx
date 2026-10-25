/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { Copyright, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Blog } from "@/types/hubs/blogs";

const chip =
  "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[11px] leading-none";

interface BlogLabelsProps {
  blog: Pick<Blog, "isFeatured" | "category" | "license">;
  className?: string;
}

/** Featured status, category and license of a post, as square chips. */
export function BlogLabels({ blog, className }: BlogLabelsProps) {
  const t = useTranslations("Blog");
  const tLicense = useTranslations("Blog.licenses");
  // "All Rights Reserved" -> "AllRightsReserved"; names like "CC BY" stay as they are
  const licenseKey = blog.license.replace(/[^A-Za-z0-9]/g, "");
  const license = tLicense.has(licenseKey) ? tLicense(licenseKey) : blog.license;

  return (
    <ul aria-label={t("labels")} className={cn("flex flex-wrap gap-2", className)}>
      {blog.isFeatured && (
        <li className={cn(chip, "border-foreground bg-foreground text-background")}>
          <Star className="size-3 fill-current" aria-hidden="true" />
          {t("featured")}
        </li>
      )}
      {blog.category && (
        <li className={cn(chip, "border-foreground/40 text-foreground")}>
          {blog.category.name}
        </li>
      )}
      <li className={cn(chip, "border-border text-muted-foreground")}>
        <Copyright className="size-3" aria-hidden="true" />
        {license}
      </li>
    </ul>
  );
}
