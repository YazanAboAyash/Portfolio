/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Link2, Mail } from "lucide-react";
import { contactEmailLink } from "@/data/main/contact";
import { cn } from "@/lib/utils";

const actionClass =
  "inline-flex h-9 items-center gap-2 border border-border px-4 text-sm transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export function BlogCopyLinkButton({ className }: { className?: string }) {
  const t = useTranslations("Blog");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={cn(actionClass, className)}
    >
      {copied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Link2 className="size-4" aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? t("linkCopied") : t("copyLink")}</span>
    </button>
  );
}

export function BlogPostActions({ title }: { title: string }) {
  const t = useTranslations("Blog");
  const subject = encodeURIComponent(t("replySubject", { title }));

  return (
    <div className="flex flex-wrap gap-3">
      <BlogCopyLinkButton />
      <a href={`${contactEmailLink}?subject=${subject}`} className={actionClass}>
        <Mail className="size-4" aria-hidden="true" />
        {t("replyByEmail")}
      </a>
    </div>
  );
}
