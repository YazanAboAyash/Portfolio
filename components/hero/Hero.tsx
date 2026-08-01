/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calendar, ExternalLink } from "lucide-react";

function Hero() {
  const t = useTranslations("Hero");
  const light = "from-black/90 to-gray-500";

  return (
    <section
      id="home2"
      className="w-full flex items-center justify-center scroll-mt-16"
      aria-label="Hero section"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden border-4 border-border shadow-2xl aspect-square">
              <Image
                src="/profileDark.jpg"
                alt="Yazan Abo-Ayash - Full Stack Developer profile picture"
                width={400}
                height={400}
                className="w-full h-full object-cover"
                priority
                fetchPriority="high"
                quality={75}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                loading="eager"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 max-w-4xl">
            <div className="space-y-4">
              <h1
                className={`bg-linear-to-r text-transparent flex justify-center text-3xl sm:text-3xl md:text-4xl lg:text-5xl
                            ${light} bg-clip-text font-extrabold
                          dark:from-gray-900 dark:to-gray-200`}
              >
                Yazan Abo-Ayash
              </h1>
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl lg:text-2xl font-medium text-muted-foreground">
                  {t("fullStackDeveloper")}
                </h2>
              </div>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed bg-background/80 backdrop-blur-sm rounded-lg px-4 py-3">
              {t("description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
              <Button asChild className="gap-2 cursor-pointer">
                <a
                  href="https://calendly.com/abo-ayash-yazan/intro-call"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {t("bookFreeCall")}
                </a>
              </Button>
              <Button asChild className="gap-2 cursor-pointer">
                <Link href="/about" className="flex items-center gap-2">
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  {t("learnMoreAboutMe")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
