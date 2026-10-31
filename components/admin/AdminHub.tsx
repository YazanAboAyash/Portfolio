/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  FilePenLine,
  MessageSquareHeart,
  MessageSquareText,
} from "lucide-react";
import { cardSurface, SectionHeading } from "@/components/visuals";
import { cn } from "@/lib/utils";

const groupLabelClass =
  "text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground";

function WorkspaceCard({
  href,
  icon: Icon,
  title,
  description,
  action,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        cardSurface,
        "flex flex-col gap-8 p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:p-8",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="flex size-11 items-center justify-center bg-background">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <ArrowUpRight
          className="h-5 w-5 transition-transform duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-2xl font-bold tracking-[-0.015em]">{title}</h3>
        <p className="text-sm leading-relaxed text-foreground/80">
          {description}
        </p>
      </div>
      <span className="text-sm font-semibold">{action}</span>
    </Link>
  );
}

export function AdminHub() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeading
        as="h1"
        title="Your control room."
        lead="Manage your content, conversations and visitor feedback. Choose a workspace to get started."
      />
      <section aria-labelledby="admin-capabilities" className="flex flex-col gap-5">
        <h2 id="admin-capabilities" className={groupLabelClass}>
          Workspaces
        </h2>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          <WorkspaceCard
            href="/admin/blog"
            icon={FilePenLine}
            title="Blog"
            description="Write articles, manage drafts, and control what gets published."
            action="Manage blog"
          />
          <WorkspaceCard
            href="/admin/chatbot"
            icon={MessageSquareText}
            title="Chatbot logs"
            description="Review conversations, check consent, and manage stored chat sessions."
            action="Review conversations"
          />
          <WorkspaceCard
            href="/admin/feedback"
            icon={MessageSquareHeart}
            title="Feedback"
            description="Approve what visitors left before it appears on the home page."
            action="Review feedback"
          />
        </div>
      </section>
    </div>
  );
}
