/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Mail } from "lucide-react";
import { contactEmailLink } from "@/data/main/contact";
import { usePreviewDescription } from "@/hooks/use-locale-preview";

/** Both portraits stay in the DOM; the `dark` class picks one, so there is no flash on load. */
const PORTRAIT_SIZES = "(min-width: 768px) 50vw, 100vw";

function Hero() {
  const t = useTranslations("Hero");
  const locale = useLocale();
  const preview = usePreviewDescription(locale);

  return (
    <section
      id="home2"
      className="frame grid scroll-mt-16 grid-cols-12 gap-x-6 gap-y-10 pt-6 md:pt-10"
      aria-labelledby="hero-title"
    >
      <div className="col-span-12 flex flex-col md:col-span-6 md:pr-6 lg:pr-12">
        {/* Copy stays centred against the portrait; the scroll cue sits at its bottom edge */}
        <div className="my-auto flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <h1
              id="hero-title"
              className="text-[clamp(2.5rem,1.4rem+3.6vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.035em] text-balance"
            >
              Yazan Abo-Ayash
            </h1>
            <h2 className="max-w-[26ch] text-[clamp(1.25rem,1.05rem+0.8vw,1.75rem)] font-semibold leading-tight">
              {t("fullStackDeveloper")}
            </h2>
          </div>

          <p
            lang={preview?.locale ?? locale}
            aria-live="polite"
            className="max-w-[46ch] text-lg leading-relaxed text-foreground transition-opacity duration-200 motion-reduce:transition-none"
          >
            {preview?.text ?? t("description")}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href={contactEmailLink}
              className="inline-flex min-h-12 items-center gap-2.5 bg-primary px-6 font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("contact")}
            </a>
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center gap-2 bg-surface px-6 font-semibold transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {t("learnMoreAboutMe")}
            </Link>
            <a
              href="#mcp"
              className="group inline-flex items-center gap-1.5 font-semibold underline decoration-surface-2 decoration-2 underline-offset-[6px] transition-colors hover:decoration-foreground"
            >
              {t("askMcp")}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-10 hidden lg:block" aria-hidden="true">
          <div className="flex h-10 w-6 animate-bounce justify-center rounded-full border-2 border-muted-foreground motion-reduce:animate-none">
            <div className="mt-2 h-3 w-1 rounded-full bg-muted-foreground"></div>
          </div>
        </div>
      </div>

      <figure className="relative col-span-12 aspect-4/5 overflow-hidden bg-surface sm:aspect-4/3 md:col-span-6 md:aspect-auto md:min-h-[min(68svh,46rem)]">
        <Image
          src="/portrait-light.jpg"
          alt={t("portraitAltLight")}
          fill
          priority
          sizes={PORTRAIT_SIZES}
          className="portrait-drift object-cover object-[50%_22%] dark:hidden"
        />
        <Image
          src="/portrait-dark.jpg"
          alt={t("portraitAltDark")}
          fill
          priority
          sizes={PORTRAIT_SIZES}
          className="portrait-drift hidden object-cover object-[50%_30%] dark:block"
        />
      </figure>
    </section>
  );
}

export default Hero;
