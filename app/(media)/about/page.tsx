/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AboutTranslations } from "@/types/configs/i18n";
import Image from "next/image";
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
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {t("mainStory")}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {getCurrentFocusItems()
                      .slice(0, 3)
                      .map((focus: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {focus}
                        </Badge>
                      ))}
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
