/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CTAButton } from "@/components/ui/cta-button";
import type { AboutTranslations } from "@/types/configs/i18n";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("About");
  const light = "from-black/90 to-gray-500";
  const getCurrentFocusItems = (): AboutTranslations["currentFocusItems"] => {
    return t.raw("currentFocusItems") as AboutTranslations["currentFocusItems"];
  };

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-12 pb-20 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 lg:p-12 bg-background/80 backdrop-blur-sm border-border/50 shadow-lg">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <Badge variant="outline" className="w-fit">
                    {t("badge")}
                  </Badge>
                  <h1
                    className={`bg-linear-to-r text-transparent flex text-3xl sm:text-3xl md:text-4xl lg:text-5xl
                            ${light} bg-clip-text font-extrabold
                          dark:from-gray-900 dark:to-gray-200`}
                  >
                    {t("personalInfo.name")}
                  </h1>
                  <p className="text-xl text-primary font-semibold leading-relaxed">
                    {t("personalInfo.title")}
                  </p>
                  <div className="space-y-4">
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {t("mainStory")}
                    </p>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {t("workingWithMe")}
                    </p>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {t("credentials")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {getCurrentFocusItems().map(
                      (focus: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {focus}
                        </Badge>
                      ),
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button asChild variant="outline">
                      <Link href="/projects">
                        {t("cta.work")}
                        <ArrowRight
                          className="h-4 w-4 ml-2"
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                    <CTAButton label={t("cta.call")} />
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square max-w-md mx-auto relative rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src="/aboutMe.jpg"
                      alt={t("personalInfo.name")}
                      fill
                      className="object-cover"
                      priority={false}
                      quality={85}
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      sizes="(max-width: 768px) 300px, (max-width: 1024px) 400px, 500px"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
