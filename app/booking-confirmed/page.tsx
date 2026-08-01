/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { Calendar, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function BookingConfirmedPage() {
  const t = useTranslations("BookingConfirmed");

  return (
    <>
      <main
        className="min-h-[80vh] w-full flex items-center justify-center px-4 pt-12 md:pt-24"
        role="main"
        aria-label="Booking confirmation"
      >
        <div className="max-w-xl mx-auto text-center space-y-8 flex flex-col items-center">
          {/* Content */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              {t("confirmed")}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center justify-center gap-3">
              <Calendar className="w-8 h-8 text-primary" aria-hidden="true" />
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 space-y-3 text-left">
            <h2 className="font-semibold text-foreground">{t("whatsNext")}</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">1.</span>
                {t("step1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">2.</span>
                {t("step2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">3.</span>
                {t("step3")}
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t("backToHome")}
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/about">{t("learnMore")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
