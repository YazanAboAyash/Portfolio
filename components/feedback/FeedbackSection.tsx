/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/visuals";
import { cn } from "@/lib/utils";
import FeedbackForm from "./FeedbackForm";
import FeedbackWall from "./FeedbackWall";

const groupLabelClass =
  "text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground";

/**
 * Visitor feedback, under Contact on the home page: the form on one side, the
 * approved entries on the other. Every entry is moderated and then approved by
 * hand before it can appear.
 */
export default function FeedbackSection({ className }: { className?: string }) {
  const t = useTranslations("Feedback");

  return (
    <section
      id="feedback"
      aria-labelledby="feedback-title"
      className={cn("scroll-mt-20", className)}
    >
      <SectionHeading
        id="feedback-title"
        title={t("title")}
        lead={t("lead")}
        className="mb-10"
      />

      <div className="grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <FeedbackForm />
        </div>
        <div className="col-span-12 flex flex-col gap-5 lg:col-span-7">
          <p className={groupLabelClass}>{t("wall.title")}</p>
          <FeedbackWall />
        </div>
      </div>
    </section>
  );
}
